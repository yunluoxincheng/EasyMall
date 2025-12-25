
@echo off
echo ========================================
echo   EasyMall Docker Dev Environment
echo ========================================
echo.
echo Starting services...
docker-compose -f docker-compose.yml -f docker-dev.yml up -d
echo.
if %errorlevel% equ 0 (
    echo Started successfully\!
    echo.
    echo Services:
    echo   - App: http://localhost:8080
    echo   - MySQL: localhost:3306
    echo   - Redis: localhost:6379
    echo   - Elasticsearch: http://localhost:9200
    echo.
    echo Useful commands:
    echo   docker-compose ps              - Show running containers
    echo   docker-compose logs -f         - View logs
    echo   docker-compose restart         - Restart services
    echo   docker-compose down            - Stop all services
    echo   docker exec -it easymall-app bash  - Enter container
    echo.
    echo You can now run docker commands...
    echo.
) else (
    echo Failed to start\!
    echo.
)
cmd /k

