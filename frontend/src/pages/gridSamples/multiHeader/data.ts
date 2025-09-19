interface DataInfo {
  deptName: string;
  empName: string;
  year: number;
  month: number;
  plan: number;
  actual: number;
}
type EmpInfo = Pick<DataInfo, 'deptName' | 'empName'>;
const empInfo: EmpInfo[] = [
  {
    deptName: 'BS1팀',
    empName: '차경화',
  },
  {
    deptName: 'BS1팀',
    empName: '백정명',
  },
  {
    deptName: 'BS2팀',
    empName: '홍민기',
  },
  {
    deptName: 'BS2팀',
    empName: '권순용',
  },
  {
    deptName: 'BS3팀',
    empName: '김정욱',
  },
  {
    deptName: 'BS3팀',
    empName: '이민수',
  },
];

const getData = (): DataInfo[] => {
  const result: DataInfo[] = [];
  const year = 2024;

  empInfo.forEach((emp) => {
    for (let y = 0; y < 2; y++) {
      for (let m = 1; m <= 12; m++) {
        result.push({
          deptName: emp.deptName,
          empName: emp.empName,
          year: year + y,
          month: m,
          plan: 100,
          actual: Math.floor(Math.random() * 100),
        });
      }
    }
  });

  return result;
};
