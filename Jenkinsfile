
pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'vehicle-rental-frontend'
        BACKEND_IMAGE = 'vehicle-rental-backend'
        IMAGE_TAG = '1.0'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Getting Vehicle Rental source code from GitHub'
                checkout scm
            }
        }

        stage('Check Project Files') {
            steps {
                sh '''
                    test -f frontend/index.html
                    test -f frontend/Dockerfile
                    test -f backend/server.js
                    test -f backend/package.json
                    test -f backend/Dockerfile
                    test -f database/init.sql
                '''
            }
        }

        stage('Check Backend Code') {
            steps {
                sh '''
                    node --check backend/server.js
                '''
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh '''
                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                '''
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh '''
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                '''
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh '''
                    docker images ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker images ${BACKEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Vehicle Rental System built successfully!'
        }
        failure {
            echo 'FAILED: Check the Jenkins console output.'
        }
    }
}
