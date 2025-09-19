# Security Policy

## Vulnerability Scanning
- **npm audit**: Dependency vulnerability check (HIGH+ severity fails build)
- **Semgrep**: Static code analysis for security issues
- **Trivy**: Container image vulnerability scanning
- **Secret detection**: Basic grep for hardcoded secrets

## Security Gates
- Build fails on HIGH/CRITICAL vulnerabilities
- Manual review required for MEDIUM issues
- All secrets must use environment variables
- Container images scanned before deployment

## Reporting
- Security reports archived in Jenkins
- Vulnerability details in build logs
- HTML reports for detailed analysis