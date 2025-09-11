# SpringBoot & React Project & typeScript

## 🖥️ 프로젝트 소개
E1정보기술 BS 3팀 UDA 시스템 관리 프로젝트 입니다. 
<br>
Springboot 와 react & typescript를 통해 개발을 진행하였고 ubuntu server에 jenkins 서버를 설치하여 docker compose를 통해 배포를 하였습니다
<br>

## 🕰️ 개발 기간
* 25.07.16 ~ 

## ⚙️ 개발 환경
- `node v22.17.1`
- `react v18.2.1`
- `typescirpt v5.9.2`
- `spring boot v3.4.7`
- - `openjdk 17`
- `jenkins v2.516.1`
- `redis v8.2.1`
- `docker v27.5.1`
- - `docker compose v2.35.1`
- **IDE** : Visual Studio Code
- **Database** : mysql 8.0

## 🛠️ 주요 라이브러리

### react & typescript
| 구분       | 패키지/기술명                | 버전        |
| ---------- | --------------------------- | ----------- |
| 상태관리   | Zustand                     | 5.0.4       |
| 번들러     | Vite                        | 7.0.4      |
| 타입       | TypeScript                  | 5.9.2       |
| 라우팅     | react-router-dom            | 7.6.3       |
| UI         | Material-UI,antd            | 7.2.0, 5.26.4     |
| 그리드      | wijmo                      | 5.20251.40    |
| 기타       | axios                        | 1.10.0       |
| 품질       | ESLint, Prettier            | 9.x, 3.x    |

### springboot
| 구분       | 패키지/기술명                | 버전        |
| ---------- | --------------------------- | ----------- |
| 인증        | jsonwebtoken                |  0.11.5     |
| 엑셀 업로드 & 다운로드  |  apache poi      |  5.2.5       |
| 쿼리  |  mybatis      |  3.0.4      |


## 🔧 주요 설정
### 경로 별칭 (Path Aliases)

```typescript
// tsconfig.json & vite.config.js
{
  "@/*": ["src/*"],
  "@pages/*": ["src/pages/*"],
  "@component/*": ["src/components/*"],
  "@api/*": ["src/api/*"],
  "@data/*": ["src/data/*"],
  "@assets/*": ["src/assets/*"],
  "@utils/*": ["src/utils/*"],
  "@store/*": ["src/store/*"],
  "@hooks/*": ["src/hooks/*"],
  "@router/*": ["src/router/*"],
  "@layout/*": ["src/layout/*"]
}
```

## 📌 시작하기

#### 1. 아래처럼 git을 clone하거나 zip으로 다운로드
```bash
$ git clone https://github.com/e1-mslee/reactProject.git
```

## 📁 프로젝트 구조
```
bs3_study
├─ backend
│  ├─ .mvn
│  │  └─ wrapper
│  │     └─ maven-wrapper.properties
│  ├─ Dockerfile
│  ├─ HELP.md
│  ├─ mvnw
│  ├─ mvnw.cmd
│  ├─ pom.xml
│  └─ src
│     ├─ main
│     │  ├─ java
│     │  │  └─ com
│     │  │     └─ e1
│     │  │        └─ backend
│     │  │           ├─ auth
│     │  │           │  └─ TokenProvider.java
│     │  │           ├─ BackendApplication.java
│     │  │           ├─ config
│     │  │           │  ├─ RedisConfig.java
│     │  │           │  ├─ SecurityConfig.java
│     │  │           │  └─ WebConfig.java
│     │  │           ├─ Controller
│     │  │           │  ├─ ApiController.java
│     │  │           │  ├─ AuthController.java
│     │  │           │  └─ KjoApiController.java
│     │  │           ├─ dto
│     │  │           │  ├─ CustomUserDetails.java
│     │  │           │  ├─ UserDto.java
│     │  │           │  └─ UserEntity.java
│     │  │           ├─ filter
│     │  │           │  └─ JwtAuthenticationFilter.java
│     │  │           ├─ mapper
│     │  │           │  ├─ ApiMapper.java
│     │  │           │  ├─ KjoApiMapper.java
│     │  │           │  └─ UserMapper.java
│     │  │           ├─ service
│     │  │           │  ├─ ApiService.java
│     │  │           │  ├─ CustomUserDetailsService.java
│     │  │           │  └─ KjoApiService.java
│     │  │           └─ serviceimpl
│     │  │              ├─ ApiServiceImpl.java
│     │  │              └─ KjoApiServiceImpl.java
│     │  └─ resources
│     │     ├─ application.properties
│     │     ├─ logback-spring.xml
│     │     ├─ mybatis
│     │     │  └─ sql
│     │     │     ├─ kjo
│     │     │     │  └─ kjoApi.xml
│     │     │     └─ lms
│     │     │        └─ api.xml
│     │     ├─ static
│     │     └─ templates
│     └─ test
│        └─ java
│           └─ com
│              └─ e1
│                 └─ backend
│                    └─ BackendApplicationTests.java
├─ docker-compose.yml
├─ frontend
│  ├─ .dockerignore
│  ├─ .env
│  ├─ .env.production
│  ├─ default.conf
│  ├─ Dockerfile
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.ico
│  │  └─ font
│  │     ├─ NotoSansCJKkr-Black.otf
│  │     ├─ NotoSansCJKkr-Bold.otf
│  │     ├─ NotoSansCJKkr-DemiLight.otf
│  │     ├─ NotoSansCJKkr-Light.otf
│  │     ├─ NotoSansCJKkr-Medium.otf
│  │     ├─ NotoSansCJKkr-Regular.otf
│  │     ├─ NotoSansCJKkr-Thin.otf
│  │     ├─ NotoSansMonoCJKkr-Bold.otf
│  │     ├─ NotoSansMonoCJKkr-Regular.otf
│  │     └─ Roboto-Regular.ttf
│  ├─ README.md
│  ├─ src
│  │  ├─ .prettierignore
│  │  ├─ .prettierrc.yml
│  │  ├─ api
│  │  │  ├─ api.ts
│  │  │  ├─ Auth.ts
│  │  │  ├─ lmsApi.ts
│  │  │  ├─ lmsDocApi.ts
│  │  │  ├─ lmsHeaderApi.ts
│  │  │  ├─ lmsPopApi.ts
│  │  │  └─ types.ts
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  └─ Logo.png
│  │  ├─ components
│  │  │  └─ BaseButton.jsx
│  │  ├─ data
│  │  │  ├─ data.ts
│  │  │  └─ menuItems.tsx
│  │  ├─ hooks
│  │  │  └─ useRemoveWijmoLink.ts
│  │  ├─ index.css
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Header.tsx
│  │  │  └─ Sidebar.tsx
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ Home.tsx
│  │  │  ├─ kjo
│  │  │  │  ├─ kjo.css
│  │  │  │  ├─ Kjo.tsx
│  │  │  │  ├─ kjoHeaderPopup.tsx
│  │  │  │  └─ KjoPop.tsx
│  │  │  ├─ lms
│  │  │  │  ├─ Lms.css
│  │  │  │  ├─ Lms.tsx
│  │  │  │  ├─ LmsDoc.tsx
│  │  │  │  ├─ LmsHeader.tsx
│  │  │  │  └─ LmsPop.tsx
│  │  │  ├─ Login.css
│  │  │  ├─ Login.tsx
│  │  │  └─ Notfound.tsx
│  │  ├─ router
│  │  │  └─ routes
│  │  │     ├─ MainRoute.tsx
│  │  │     └─ PopupRoute.tsx
│  │  ├─ store
│  │  │  ├─ commonStore.ts
│  │  │  ├─ kjo
│  │  │  │  ├─ kjoHeaderStore.ts
│  │  │  │  ├─ kjoPopupStore.ts
│  │  │  │  └─ kjoStroe.ts
│  │  │  └─ lms
│  │  │     ├─ lmsDocStore.ts
│  │  │     ├─ lmsHeaderStore.ts
│  │  │     ├─ lmsPopStore.ts
│  │  │     └─ lmsStore.ts
│  │  └─ utils
│  │     ├─ openPop.ts
│  │     └─ tableUtils.ts
│  ├─ tsconfig.json
│  ├─ vite-env.d.ts
│  └─ vite.config.js
├─ Jenkinsfile
├─ README.md
├─ table.sql
└─ UDA 시스템관리.pptx

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


### 인증 시스템
#### jwt을 통해 access tocken과 refresh tocken을 통해 인증(redis 서버를 통한 동기화)

---

##### 이후 자세한 실행 내용은 React_Springboot 개발환경_메뉴얼_이민수.pptx 참조
