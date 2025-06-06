pipeline {
    agent any

    stages {

        stage('Clean Deploy Folder') {
            steps {
                sh '''
                    echo "배포 디렉토리 정리"
                    pkill -f "java -jar" || true
                    pkill -f "vite" || true

                    echo "node_modules 삭제"
                    rm -rf /var/lib/jenkins/workspace/bsm/frontend/node_modules
                '''
            }
        }


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

                    nohup java -jar employee-management-0.0.1-SNAPSHOT.jar > /dev/null 2>&1 &

                    echo "백엔드 배포 완료"
                '''
            }
        }

        stage('Run Frontend Dev Server') {
            steps {
                sh '''
                    echo "프론트엔드 개발 서버 시작"
                    cd frontend
                    npm install
                    nohup npm run dev -- --host 0.0.0.0 > ../frontend-dev.log 2>&1 &
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
