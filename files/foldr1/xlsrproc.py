import pandas as pd
import re
import xlsxwriter
import os
import time
filenm='ragil.xlsx'
#generator for AB style excell cells
repname = os.path.join(os.getcwd(),
                       'phones' + time.strftime("%d%m%Y_%H-%M-%S", time.gmtime(time.time())) + '.xlsx')
workbook = xlsxwriter.Workbook(repname)
summary_report = workbook.add_worksheet('summary_report')

#generator for AB style excell cells
def colnum_string(n):
    string = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        string = chr(65 + remainder) + string
    return string

# wob=xlrd.open_workbook(filenm)
data_frame=pd.read_excel(filenm, header=None)
print(data_frame.columns)
print('\n'*3)
phones={}
source={}
counter=0
for row in data_frame.iterrows():
    print(">" * 30)
    ind = row[0]
    #init telephones list per index
    phones[ind]=[]
    #converting to list and stringifying each item in list for further processing
    rowcells = map(lambda v: str(v), row[1].tolist())
    source[ind]=[]
    print(ind)
    for cell in rowcells:
        if cell != 'nan':
            source[ind].append(cell)
        #splitting in case of multi rows
        cell=cell.split("\n")
        for chunk in cell:
            if len(chunk) > 5:
                res=re.search('([+]?[0-9]{0,4}[- ]?[0-9]{0,4}[- ]?[(]?[0-9]{1,4}[- ]?[)]?[0-9]{0,4}[- ]?[(]?[0-9]{1,4}[-]?[)]?[0-9]{0,4}[-]?[(]?[0-9]{1,4}[)]?[-\s\./0-9][0-9])(.*$)', chunk)
                print(res)
                print('.' * 30)
                print(chunk,' -> ', res)
                print('.' * 30)
                if res:
                    phones[ind].append(res[1])
                    counter=counter+1
    print(">" * 30)
    print('\n' * 3)

print(phones)
print(counter)
for ind in phones:
    cell=source[ind]
    summary_report.write('A{}'.format(ind), cell[0])
    cell.pop(0)
    s=" "
    cell=s.join(cell)
    cell = cell.strip('\n')
    summary_report.write('B{}'.format(ind), cell)

    for phind, phone in enumerate(phones[ind]):
        summary_report.write('{}{}'.format(colnum_string(phind+3),ind), str(phones[ind][phind]))



workbook.close()