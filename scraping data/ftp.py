from ftplib import FTP

# accessing the ftp server
ftp = FTP('ftp.bom.gov.au')
ftp.login()  # anonymous login
ftp.cwd('/anon/gen/fwo')

# the xml file with the data we need
filename = 'IDV60920.xml'

# opening file
with open(filename, 'wb') as f:
    ftp.retrbinary(f'RETR {filename}', f.write)

# downloading file
ftp.quit()
print(f"Downloaded {filename}")
