pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                // तुमच्या प्रोजेक्टसाठी लागणाऱ्या डिपेंडन्सीज इन्स्टॉल करण्यासाठी
                bat 'npm install'
            }
        }
        stage('Build') {
            steps {
                // प्रोजेक्ट बिल्ड करण्यासाठी
                bat 'npm run build'
            }
        }
    }
}