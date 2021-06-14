#!/bin/bash
pause() {
    read -p "Press any key to exit..."
    exit
}

if ! [ -d "node_modules"]; then
    npm i --silent --production
    results=$?
    if [ $results -eq 127 ]; then
        echo "Install npm before using this command"
        pause
    elif ! [ $results -eq 0 ]; then
        echo "An error occurred while installing modules"
        pause
    fi
fi

npm start