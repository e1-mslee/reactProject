pipeline {
    agent any

    stages {
        stage('Build Backend') {
            steps {
                script {
                    // 백엔드 빌드
                    dir('backend') {
                        sh 'mvn clean package -DskipTests'  // 백엔드 빌드
                    }
                }
            }
        }


        stage('Deploy with Docker Compose') {
            steps {
                dir("${WORKSPACE}") {
                    sh 'docker compose down'
                    sh 'docker compose up -d --build'
                }
            }
        }
    }
}
