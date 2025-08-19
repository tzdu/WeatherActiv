from ftplib import FTP

ftp = FTP('ftp.bom.gov.au')
ftp.login()  # anonymous login
ftp.cwd('/anon/gen/fwo')

filename = 'IDV60920.xml'

with open(filename, 'wb') as f:
    ftp.retrbinary(f'RETR {filename}', f.write)

ftp.quit()
print(f"Downloaded {filename}")