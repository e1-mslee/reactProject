pipeline {
    agent any

    stages {
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
