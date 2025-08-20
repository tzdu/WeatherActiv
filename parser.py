import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Any, Optional
import json

class BoMWeatherParser:
    """Parser for Bureau of Meteorology XML weather data optimized for database storage"""
    
    def __init__(self):
        self.parsed_data = {
            'metadata': {},
            'stations': [],
            'observations': []
        }
    
    def parse_file(self, filename: str) -> Dict[str, Any]:
        """Parse XML file and return structured data ready for database insertion"""
        try:
            tree = ET.parse(filename)
            root = tree.getroot()
            return self.parse_xml(root)
        except ET.ParseError as e:
            print(f"Error parsing XML file: {e}")
            return {'error': str(e)}
        except FileNotFoundError:
            print(f"File {filename} not found")
            return {'error': f"File {filename} not found"}
    
    def parse_xml_string(self, xml_string: str) -> Dict[str, Any]:
        """Parse XML string and return structured data"""
        try:
            root = ET.fromstring(xml_string)
            return self.parse_xml(root)
        except ET.ParseError as e:
            print(f"Error parsing XML string: {e}")
            return {'error': str(e)}
    
    def parse_xml(self, root: ET.Element) -> Dict[str, Any]:
        """Parse XML root element and return database-ready structured data"""
        self.parsed_data = {
            'metadata': {},
            'stations': [],
            'observations': []
        }
        
        # Extract metadata
        self._extract_metadata(root)
        
        # Extract station observations
        observations_elem = root.find('observations')
        if observations_elem is not None:
            for station in observations_elem.findall('station'):
                station_data, observation_data = self._parse_station(station)
                if station_data and observation_data:
                    self.parsed_data['stations'].append(station_data)
                    self.parsed_data['observations'].append(observation_data)
        
        return self.parsed_data
    
    def _extract_metadata(self, root: ET.Element):
        """Extract metadata for database storage"""
        amoc = root.find('amoc')
        if amoc is not None:
            source = amoc.find('source')
            self.parsed_data['metadata'] = {
                'report_id': self._get_text(amoc.find('identifier')),
                'issue_time_utc': self._parse_datetime(self._get_text(amoc.find('issue-time-utc'))),
                'issue_time_local': self._parse_datetime(self._get_text(amoc.find('issue-time-local'))),
                'sent_time': self._parse_datetime(self._get_text(amoc.find('sent-time'))),
                'sender': self._get_text(source.find('sender')) if source is not None else None,
                'office': self._get_text(source.find('office')) if source is not None else None,
                'region': self._get_text(source.find('region')) if source is not None else None,
                'status': self._get_text(amoc.find('status')),
                'service': self._get_text(amoc.find('service')),
                'product_type': self._get_text(amoc.find('product-type'))
            }
    
    def _parse_station(self, station: ET.Element) -> tuple[Optional[Dict], Optional[Dict]]:
        """Parse station data and return separate station and observation dictionaries"""
        try:
            # Station metadata (for stations table)
            station_data = {
                'wmo_id': station.get('wmo-id'),
                'bom_id': station.get('bom-id'),
                'station_name': station.get('stn-name'),
                'station_description': station.get('description'),
                'latitude': self._get_float(station.get('lat')),
                'longitude': self._get_float(station.get('lon')),
                'height_meters': self._get_float(station.get('stn-height')),
                'timezone': station.get('tz'),
                'station_type': station.get('type'),
                'forecast_district_id': station.get('forecast-district-id')
            }
            
            # Get the most recent observation period
            period = station.find('period[@index="0"]')
            if period is None:
                return station_data, None
            
            # Observation data (for observations table)
            observation_data = {
                'bom_id': station.get('bom-id'),  # Foreign key to stations
                'wmo_id': station.get('wmo-id'),
                'station_name': station.get('stn-name'),
                'observation_time_utc': self._parse_datetime(period.get('time-utc')),
                'observation_time_local': self._parse_datetime(period.get('time-local')),
                'wind_source': period.get('wind-src')
            }
            
            # Extract surface level measurements
            level = period.find('level[@type="surface"]')
            if level is not None:
                measurements = self._extract_measurements(level)
                observation_data.update(measurements)
            
            return station_data, observation_data
            
        except Exception as e:
            print(f"Error parsing station {station.get('stn-name', 'Unknown')}: {e}")
            return None, None
    
    def _extract_measurements(self, level: ET.Element) -> Dict[str, Any]:
        """Extract all measurement data with database-friendly field names"""
        measurements = {}
        
        # Define mapping from XML element types to database field names
        measurement_mappings = {
            # Temperature measurements
            'air_temperature': 'temperature_celsius',
            'apparent_temp': 'apparent_temperature_celsius',
            'dew_point': 'dew_point_celsius',
            'maximum_air_temperature': 'max_temperature_celsius',
            'minimum_air_temperature': 'min_temperature_celsius',
            
            # Pressure measurements
            'pres': 'station_pressure_hpa',
            'msl_pres': 'sea_level_pressure_hpa',
            'qnh_pres': 'qnh_pressure_hpa',
            
            # Wind measurements
            'wind_spd_kmh': 'wind_speed_kmh',
            'wind_spd': 'wind_speed_knots',
            'wind_dir': 'wind_direction',
            'wind_dir_deg': 'wind_direction_degrees',
            'gust_kmh': 'wind_gust_kmh',
            'wind_gust_spd': 'wind_gust_knots',
            'maximum_gust_kmh': 'max_gust_kmh',
            'maximum_gust_spd': 'max_gust_knots',
            'maximum_gust_dir': 'max_gust_direction',
            
            # Precipitation
            'rain_hour': 'rainfall_1hr_mm',
            'rain_ten': 'rainfall_10min_mm',
            'rainfall': 'rainfall_period_mm',
            'rainfall_24hr': 'rainfall_24hr_mm',
            
            # Other measurements
            'rel-humidity': 'relative_humidity_percent',
            'vis_km': 'visibility_km',
            'cloud': 'cloud_description',
            'cloud_oktas': 'cloud_oktas',
            'delta_t': 'delta_t_celsius'
        }
        
        for element in level.findall('element'):
            element_type = element.get('type')
            if element_type in measurement_mappings:
                field_name = measurement_mappings[element_type]
                
                # Handle different data types
                if element_type in ['wind_dir', 'cloud', 'maximum_gust_dir']:
                    # String values
                    measurements[field_name] = element.text
                else:
                    # Numeric values
                    measurements[field_name] = self._get_float(element.text)
                
                # Store timing information for min/max values
                if element_type in ['maximum_air_temperature', 'minimum_air_temperature', 
                                  'maximum_gust_kmh', 'maximum_gust_spd']:
                    time_field = field_name.replace('_celsius', '_time').replace('_kmh', '_time').replace('_knots', '_time')
                    measurements[time_field + '_utc'] = self._parse_datetime(element.get('time-utc'))
                    measurements[time_field + '_local'] = self._parse_datetime(element.get('time-local'))
        
        return measurements
    
    def _get_text(self, element: Optional[ET.Element]) -> Optional[str]:
        """Safely get text from XML element"""
        return element.text.strip() if element is not None and element.text else None
    
    def _get_float(self, value: Any) -> Optional[float]:
        """Convert value to float, return None if conversion fails"""
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _parse_datetime(self, datetime_str: Optional[str]) -> Optional[datetime]:
        """Parse datetime string to datetime object"""
        if not datetime_str:
            return None
        try:
            # Handle different datetime formats from BoM
            if datetime_str.endswith('+00:00'):
                return datetime.fromisoformat(datetime_str)
            elif datetime_str.endswith('Z'):
                return datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            elif '+' in datetime_str:
                return datetime.fromisoformat(datetime_str)
            else:
                # Assume UTC if no timezone info
                return datetime.fromisoformat(datetime_str + '+00:00')
        except ValueError:
            return None
    
    # Database specific helper methods
    def get_metadata_for_db(self) -> Dict[str, Any]:
        """Get metadata formatted for database insertion"""
        return self.parsed_data['metadata']
    
    def get_stations_for_db(self) -> List[Dict[str, Any]]:
        """Get station data formatted for database insertion"""
        return self.parsed_data['stations']
    
    def get_observations_for_db(self) -> List[Dict[str, Any]]:
        """Get observation data formatted for database insertion"""
        return self.parsed_data['observations']
    
    def get_station_by_id(self, bom_id: str) -> Optional[Dict[str, Any]]:
        """Get specific station data by BOM ID"""
        for station in self.parsed_data['stations']:
            if station['bom_id'] == bom_id:
                return station
        return None
    
    def get_observations_by_station(self, bom_id: str) -> List[Dict[str, Any]]:
        """Get observations for a specific station"""
        return [obs for obs in self.parsed_data['observations'] 
                if obs['bom_id'] == bom_id]
    
    def get_temperature_summary(self) -> List[Dict[str, Any]]:
        """Get temperature summary for all stations (useful for dashboards)"""
        summary = []
        for obs in self.parsed_data['observations']:
            station = self.get_station_by_id(obs['bom_id'])
            if station:
                summary.append({
                    'station_name': station['station_name'],
                    'bom_id': obs['bom_id'],
                    'temperature': obs.get('temperature_celsius'),
                    'apparent_temperature': obs.get('apparent_temperature_celsius'),
                    'min_temperature': obs.get('min_temperature_celsius'),
                    'max_temperature': obs.get('max_temperature_celsius'),
                    'observation_time': obs['observation_time_utc']
                })
        return summary
    
    def prepare_for_mysql_insert(self, table_name: str) -> tuple[List[str], List[tuple]]:
        """
        Prepare data for MySQL INSERT statements
        Returns: (column_names, rows_as_tuples)
        """
        if table_name == 'metadata':
            data = [self.parsed_data['metadata']]
        elif table_name == 'stations':
            data = self.parsed_data['stations']
        elif table_name == 'observations':
            data = self.parsed_data['observations']
        else:
            raise ValueError(f"Unknown table name: {table_name}")
        
        if not data or not data[0]:
            return [], []
        
        # Get column names from the first record
        columns = list(data[0].keys())
        
        # Convert to tuples for MySQL insertion
        rows = []
        for record in data:
            row = tuple(record.get(col) for col in columns)
            rows.append(row)
        
        return columns, rows
    
    def export_for_database(self, output_file: str = None) -> Dict[str, Any]:
        """Export all data in a database-friendly format"""
        db_ready_data = {
            'metadata': self.get_metadata_for_db(),
            'stations': self.get_stations_for_db(),
            'observations': self.get_observations_for_db(),
            'summary': {
                'station_count': len(self.parsed_data['stations']),
                'observation_count': len(self.parsed_data['observations']),
                'report_id': self.parsed_data['metadata'].get('report_id'),
                'issue_time': self.parsed_data['metadata'].get('issue_time_utc')
            }
        }
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(db_ready_data, f, indent=2, default=str)
            return None # To not display the entire database in the output
        
        return db_ready_data

if __name__ == "__main__":
    from ftplib import FTP
    
    print(" Starting Weather Data Pipeline")
    
    # For downloading fresh data
    print(" Downloading latest weather data")
    try:
        ftp = FTP('ftp.bom.gov.au')
        ftp.login()
        ftp.cwd('/anon/gen/fwo')
        
        filename = 'IDV60920.xml'
        with open(filename, 'wb') as f:
            ftp.retrbinary(f'RETR {filename}', f.write)
        ftp.quit()
        print(f"✅ Downloaded {filename}")
    except Exception as e:
        print(f"❌ Download failed: {e}")
        exit()
    
    # Parse the data (single instance)
    print(" Parsing weather data")
    parser = BoMWeatherParser()
    parsed_data = parser.parse_file(filename)
    
    if 'error' in parsed_data:
        print(f"❌ Parsing failed: {parsed_data['error']}")
        exit()
    
    # Get database ready data
    metadata = parser.get_metadata_for_db()
    stations = parser.get_stations_for_db()
    observations = parser.get_observations_for_db()
    
    print(f" Successfully parsed {len(stations)} stations and {len(observations)} observations")
    
    # Show summary
    print("\n" + "="*50)
    print(" WEATHER DATA SUMMARY")
    print("="*50)
    
    print(f" Data Source: {metadata.get('sender', 'BoM')}")
    print(f" Report Time: {metadata.get('issue_time_local', 'N/A')}")
    print(f" Report ID: {metadata.get('report_id', 'N/A')}")
    
    print(f"\n TEMPERATURE OVERVIEW:")
    temp_summary = parser.get_temperature_summary()
    for i, temp in enumerate(temp_summary[:5]):  # Show first 5 stations
        time_str = temp['observation_time'].strftime('%H:%M') if temp['observation_time'] else 'N/A'
        print(f"  {i+1}. {temp['station_name']}: {temp['temperature']}°C at {time_str}")
    
    if len(temp_summary) > 5:
        print(f"  ... and {len(temp_summary) - 5} more stations")
    
    # Database preparation check
    print(f"\n DATABASE READY:")
    station_columns, station_rows = parser.prepare_for_mysql_insert('stations')
    obs_columns, obs_rows = parser.prepare_for_mysql_insert('observations')
    
    print(f" Station table: {len(station_columns)} columns, {len(station_rows)} rows")
    print(f" Observations table: {len(obs_columns)} columns, {len(obs_rows)} rows")
    
    # Export backup
    backup_file = 'weather_backup.json'
    parser.export_for_database(backup_file)
    print(f" Backup saved to: {backup_file}")
    
    print("\n Pipeline completed successfully!")
    print("\n Data now ready for MySQL RDS insertion!")
    
    # Sample for verification
    print(f"\n SAMPLE STATION DATA:")
    if stations:
        sample_station = stations[0]
        print(f"  Name: {sample_station['station_name']}")
        print(f"  ID: {sample_station['bom_id']}")
        print(f"  Location: {sample_station['latitude']:.2f}, {sample_station['longitude']:.2f}")
    
    print(f"\n SAMPLE OBSERVATION DATA:")
    if observations:
        sample_obs = observations[0]
        print(f"  Station: {sample_obs['bom_id']}")
        print(f"  Temperature: {sample_obs.get('temperature_celsius', 'N/A')}°C")
        print(f"  Wind: {sample_obs.get('wind_direction', 'N/A')} at {sample_obs.get('wind_speed_kmh', 0)} km/h")
        print(f"  Humidity: {sample_obs.get('relative_humidity_percent', 'N/A')}%")


