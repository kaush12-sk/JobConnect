pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "jobconnect-ci-${BUILD_NUMBER}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Validate Compose') {
            steps {
                sh 'docker compose config --quiet'
            }
        }

        stage('Build images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Run and smoke test') {
            steps {
                sh 'docker compose up --detach'
                sh 'curl --fail --silent --show-error --retry 30 --retry-connrefused --retry-delay 2 http://localhost:5000/api/health'
                sh 'curl --fail --silent --show-error --retry 30 --retry-connrefused --retry-delay 2 http://localhost:5173/'
            }
        }
    }

    post {
        always {
            sh 'docker compose down --volumes --remove-orphans'
        }
    }
}
