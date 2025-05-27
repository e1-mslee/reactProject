pipeline {
    agent any
    stages {
        stage('Prepare'){
            steps {
                git credentialsId : '{9e76f369-b56c-438e-b11c-313c7a2ba2f4}',
                    branch : '{main}',
                    url : 'https://github.com/e1-mslee/reactProject.git'
            }
        }
        stage('test') {
            steps {
                echo 'test stage'
            }
        }
        stage('build') {
            steps {
                echo 'build stage'
            }
        }
        stage('docker build') {
            steps {
                echo 'docker build stage'
            }
        }
    }
}