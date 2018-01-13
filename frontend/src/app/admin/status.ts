import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import Status from '../../common/Status';

export function downloadResult(result: Status): void {
  const aoa1M: (string | number)[][] = [['후보자', '득표수']];
  for (const candidate of result.candidates.candidates1M) {
    aoa1M.push([candidate.name, candidate.votes]);
  }
  const sheet1M = XLSX.utils.aoa_to_sheet(aoa1M);
  const aoa1F: (string | number)[][] = [['후보자', '득표수']];
  for (const candidate of result.candidates.candidates1F) {
    aoa1F.push([candidate.name, candidate.votes]);
  }
  const sheet1F = XLSX.utils.aoa_to_sheet(aoa1F);
  const aoa2: (string | number)[][] = [['후보자', '득표수']];
  for (const candidate of result.candidates.candidates2) {
    aoa2.push([candidate.name, candidate.votes]);
  }
  const sheet2 = XLSX.utils.aoa_to_sheet(aoa2);

  const workbook = {
    Sheets: {},
    SheetNames: []
  };

  workbook.SheetNames.push('1학년 남자 부회장');
  workbook.Sheets['1학년 남자 부회장'] = sheet1M;
  workbook.SheetNames.push('1학년 여자 부회장');
  workbook.Sheets['1학년 여자 부회장'] = sheet1F;
  workbook.SheetNames.push('2학년 회장단');
  workbook.Sheets['2학년 회장단'] = sheet2;

  const wbout = XLSX.write(workbook, {
    type: 'binary'
  });
  saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '투표결과.xlsx');
}

export function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}

