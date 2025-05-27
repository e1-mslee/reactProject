pipeline {
    agent any

    stages {
        stage('Git Pull') {
            steps {
                git branch: 'main', 
                    credentialsId: '9e76f369-b56c-438e-b11c7a2ba2f4', 
                    url: 'https://github.com/e1-mslee/reactProject.git'
            }
        }

        stage('Build Backend') {
            steps {
                echo "백엔드 빌드 시작"
                sh "cd backend/employee-management && chmod +x gradlew && ./gradlew clean build -x test"
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    echo "백엔드 배포 시작"

                    pkill -f 'java -jar' || true

                    cp ./backend/employee-management/build/libs/*.jar /deploy/

                    echo "백엔드 배포 완료"
                '''
            }
        }

        stage('Build & Deploy Frontend') {
            steps {
                sh '''
                    echo "프론트엔드 빌드 및 배포 시작"

                    cd frontend
                    npm install
                    npm run build
                    cp -r dist/* /deploy/frontend/

                    echo "프론트엔드 빌드 및 배포 완료"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ 배포 성공'
        }
        failure {
            echo '❌ 배포 실패'
        }
    }
}
