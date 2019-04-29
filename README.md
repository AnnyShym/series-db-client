# series-db-client
Modern Programming Platforms [2]


A simple web client for viewing and editing the TV series database.


How to start:

- terminal
1) make sure you're in the project directory
2) enable the internet connection
3) enter 'npm install' (the first time)
4) modify 'CONNECTION_STR' in 'main.js':50 (the first time)
5) make sure your MySQL server is working
6) enter 'npm start' (the same after some changes in the code ('Ctrl+C' to stop the server))

- browser

3) go to http://localhost:8080/  (update after some changes in the code)
4) to enable styles enable your internet connection

OR

- docker
1) go to the project directory ('cd' command)
2) enable the internet connection
3) enter 'docker-compose up --build web' (the first time and after some changes in the code)
or
3) enter 'docker-compose up web' (in other cases)
- if there are some troubles with using the docker try the following
1) make sure your docker IP is the same as the IP specified in the 'CONNECTION_STR' in 'main.js':50
2) uncomment the lines related to the database connection
3) enter 'docker-compose up --build web'

- browser

3) go to http://192.168.99.100:3000/  (update after some changes in the code)
4) to enable styles enable your internet connection


To do:

- code optimization and structuring;
- improving UI;
