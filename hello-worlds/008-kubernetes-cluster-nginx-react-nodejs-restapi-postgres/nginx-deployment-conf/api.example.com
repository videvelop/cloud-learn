server {
	listen 8001;
	listen [::]:8001;

	server_name api.example.com;

	root /var/www/api.example.com;
	index index.html;

	location / {
		proxy_pass http://127.0.0.1:9001;
	}
}
