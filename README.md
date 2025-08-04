# SpringBoot & React Project

## 🖥️ 프로젝트 소개
E1정보기술 BS 3팀 UDA 시스템 관리 프로젝트 입니다. 
<br>
Springboot 와 react를 통해 개발하였으며 server에 jenkins 서버를 설치하여 docker compose를 통해 무중단 배포를 하였습니다
<br>

## 🕰️ 개발 기간
* 25.08.01 ~ 

## ⚙️ 개발 환경
- `node v22.17.1`
- `react v18.2.1`
- `spring boot v3.4.7`
- - `openjdk 17`
- `jenkins v2.516.1`
- `docker v27.5.1`
- - `docker compose v2.35.1`
- **IDE** : Visual Studio Code
- **Database** : mysql 8.0

## 🛠️ 주요 라이브러리

| 구분       | 패키지/기술명                | 버전        |
| ---------- | --------------------------- | ----------- |
| 상태관리   | Zustand                     | 5.0.4       |
| 번들러     | Vite                        | 6.3.5       |
| 타입       | TypeScript                  | 5.0.0       |
| 라우팅     | react-router-dom            | 6.2.2       |
| 폼         | react-hook-form             | 7.43.2      |
| UI         | Material-UI                 | 7.1.1       |
| 기타       | axios, dayjs, lodash        | 최신        |
| 품질       | ESLint, Prettier            | 9.x, 3.x    |

---

## 📌 시작하기

#### 1. 아래처럼 git을 clone하거나 zip으로 다운로드
```bash
$ git clone https://github.com/e1-mslee/reactProject.git
```

#### 폴더구조
```sh
├─reactProject
│  ├─ backend
│  ├─ frontend
│  │  README.md
│  │  ...

```

#### 2. frontend 폴더 경로로 이동 ( package.json이 있는 폴더) 후 npm 설치

```bash
$ cd /frontend
$ npm install
```

#### 3. frontend 폴더에서 react 실행
```bash
$ npm run dev
```
#### 4. backend 폴더에서 Springboot 실행 (BackendApplication.java)

## 🚀 배포
#### Jenkins 파이프라인 통한 자동화 배포
#### 환경별 빌드 및 배포 스크립트

## 🔧 주요 설정
### 경로 별칭 (Path Aliases)

```typescript
// tsconfig.paths.json & vite.config.ts
{
  "@/*": ["src/*"],
  "@api/*": ["src/api/*"],
  "@components/*": ["src/components/*"],
  "@models/*": ["src/models/*"],
  "@pages/*": ["src/pages/*"],
  "@utils/*": ["src/utils/*"]
}
```

### 인증 시스템

- JWT 토큰 기반 인증
- 로컬 스토리지에 토큰 저장
- 사용자 정보 및 권한 관리
- 페이지별 접근 권한 제어

---

##### 이후 자세한 실행 내용은 React_Springboot 개발환경_메뉴얼_이민수.pptx 참조
