server {
	listen 8000;
	listen [::]:8000;

	server_name reactfe.example.com;

	root /var/www/reactfe.example.com;
	index index.html;

	location / {
		try_files $uri $uri/ =404;
	}
}
