CREATE TABLE STD_MAIN (
    TABLE_SEQ INT(3) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    TABLE_NAME VARCHAR(100),
    TABLE_ID VARCHAR(10),
    VBG_CRE_USER VARCHAR(50),
    VBG_CRE_DTM DATE
);

CREATE TABLE STD_FIELD (
    TABLE_SEQ INT(3),
    COL_ID VARCHAR(10),
    COL_NAME VARCHAR(100),
    COL_TYPE VARCHAR(1),
    COL_SIZE INT(5),
    COL_IDX VARCHAR(1),
    COL_SCH VARCHAR(1),
    VBG_CRE_USER VARCHAR(50),
    VBG_CRE_DTM DATE
);

CREATE TABLE COMM_CODE (
    COM_CD_ID VARCHAR(10),
    COM_CD VARCHAR(1),
    COM_CD_NM VARCHAR(100),
    COM_CD_EN VARCHAR(10),
    SORT_SN INT(2),
    VBG_CRE_USER VARCHAR(50),
    VBG_CRE_DTM DATE,
    PRIMARY KEY (COM_CD_ID, COM_CD)
);

INSERT INTO uda.comm_code
(COM_CD_ID, COM_CD, COM_CD_NM, COM_CD_EN, SORT_SN, VBG_CRE_USER, VBG_CRE_DTM)
VALUES('00001', '1', '숫자', 'int', 1, 'LMS', '2025-07-15');
INSERT INTO uda.comm_code
(COM_CD_ID, COM_CD, COM_CD_NM, COM_CD_EN, SORT_SN, VBG_CRE_USER, VBG_CRE_DTM)
VALUES('00001', '2', '긴문자열', 'VARCHAR', 2, 'LMS', '2025-07-15');
INSERT INTO uda.comm_code
(COM_CD_ID, COM_CD, COM_CD_NM, COM_CD_EN, SORT_SN, VBG_CRE_USER, VBG_CRE_DTM)
VALUES('00001', '3', '날짜', 'DATE', 3, 'LMS', '2025-07-15');
INSERT INTO uda.comm_code
(COM_CD_ID, COM_CD, COM_CD_NM, COM_CD_EN, SORT_SN, VBG_CRE_USER, VBG_CRE_DTM)
VALUES('00001', '4', '일시', 'DATE', 4, 'LMS', '2025-07-15');
INSERT INTO uda.comm_code
(COM_CD_ID, COM_CD, COM_CD_NM, COM_CD_EN, SORT_SN, VBG_CRE_USER, VBG_CRE_DTM)
VALUES('00001', '5', '체크박스', 'check', 5, 'LMS', '2025-07-15');

INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_01_db', 'Artist Album list', 'uda_01_db', '2025-07-10', '이민수', 0, 0);
INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_32_db', 'sw 통합결재', 'uda_32_db', '2025-07-11', '김정욱', 0, 0);
INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_24_db', '회의실 현황', 'uda_24_db', '2025-07-12', '문재선', 0, 0);
INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_25_db', '금속재료조회', 'uda_25_db', '2025-07-13', '김진한', 0, 0);
INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_27_db', '배출가스', 'uda_27_db', '2025-07-14', '한은영', 0, 0);
INSERT INTO uda.std_main
(TABLE_ID, TABLE_NAME, TABLE_ID, VBG_CRE_DTM, VBG_CRE_USER, field_count, selected)
VALUES('uda_28_db', '테스트', 'uda_28_db', '2025-07-15', '홍민기', 0, 0);
