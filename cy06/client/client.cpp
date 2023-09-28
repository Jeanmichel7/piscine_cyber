#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <curl/curl.h>

void uploadFile() {
  CURL *curl;
  CURLcode res;

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "ftp://server/clientFile.txt");
    curl_easy_setopt(curl, CURLOPT_USERNAME, "user");
    curl_easy_setopt(curl, CURLOPT_PASSWORD, "user");
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

    FILE *fd = fopen("/home/clientFile.txt", "rb");
    curl_easy_setopt(curl, CURLOPT_READDATA, fd);

    if (fd) res = curl_easy_perform(curl);

    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
    else
      fprintf(stdout, "file upload");
    fflush(stdout);
    
    fclose(fd);
    curl_easy_cleanup(curl);
  }
}

void downloadFile() {
  CURL *curl;
  CURLcode res;

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "ftp://server/serverFile.txt");
    curl_easy_setopt(curl, CURLOPT_USERNAME, "user");
    curl_easy_setopt(curl, CURLOPT_PASSWORD, "user");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, NULL);

    FILE *fd = fopen("/home/serverFile.txt", "wb");
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, fd);

    if (fd) res = curl_easy_perform(curl);

    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
    else
      fprintf(stdout, "file download");
    fflush(stdout);
    fclose(fd);
    curl_easy_cleanup(curl);
  }
}

int main(void) {
  curl_global_init(CURL_GLOBAL_DEFAULT);

  while(1) {
    uploadFile();
    sleep(10);
    downloadFile();
    sleep(10);
  }

  curl_global_cleanup();

  return 0;
}