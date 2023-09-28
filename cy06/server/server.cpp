#include <stdio.h>
#include <stdlib.h>
#include <curl/curl.h>

int main(void)
{
  CURL *curl;
  CURLcode res;

  curl_global_init(CURL_GLOBAL_DEFAULT);

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "ftp://server/serverFile.txt");
    curl_easy_setopt(curl, CURLOPT_USERNAME, "username_here");
    curl_easy_setopt(curl, CURLOPT_PASSWORD, "password_here");
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

    FILE *fd = fopen("fichier_a_envoyer.txt", "rb");
    curl_easy_setopt(curl, CURLOPT_READDATA, fd);

    res = curl_easy_perform(curl);

    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));

    fclose(fd);

    curl_easy_cleanup(curl);
  }

  curl_global_cleanup();

  return 0;
}
