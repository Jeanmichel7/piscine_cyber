#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <curl/curl.h>
#include <string>

void uploadFile()
{
  CURL *curl;
  CURLcode res;
  static u_long offset = 0;

  curl = curl_easy_init();
  if (curl)
  {
    curl_easy_setopt(curl, CURLOPT_URL, "ftp://server/clientFile.txt");
    curl_easy_setopt(curl, CURLOPT_USERNAME, "user");
    curl_easy_setopt(curl, CURLOPT_PASSWORD, "user");
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

    FILE *fd = fopen("/home/clientFile.txt", "rb");
    write(fileno(fd), std::to_string(offset).c_str(), std::to_string(offset).length());
    offset++;
    curl_easy_setopt(curl, CURLOPT_READDATA, fd);

    if (fd)
      res = curl_easy_perform(curl);

    if (res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
    else
      fprintf(stdout, "file upload\n");
    fflush(stdout);

    fclose(fd);
    curl_easy_cleanup(curl);
  }
}

int main(void)
{
  curl_global_init(CURL_GLOBAL_DEFAULT);

  uploadFile();

  curl_global_cleanup();

  return 0;
}
