#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>



void ok(void){
  puts("Good job.");
  return;
}

void no(void){
  puts("Nope.");
  exit(1);
}


int main(void) {
  unsigned int uVar1;
  size_t lenRes;
  int isSame;
  bool isIterSmallerLenRes;
  char mettrea0;
  char local_3c;
  char local_3b;
  char inputscanf[24];
  char res[9];
  unsigned int iterator;
  int index8;
  int input;
  char tmp[3];


  printf("Please enter key: ");
  input = scanf("%s", inputscanf);

  if (input != 1) {
    no();
  }
  if (inputscanf[1] != '0') {
    no();
  }
  if (inputscanf[0] != '0') {
    no();
  }
  fflush(stdout);
  memset(res,0,9);
  res[0] = 'd';
  iterator = 2;
  index8 = 1;
  while( true ) {
    lenRes = strlen(res);
    uVar1 = iterator;
    isIterSmallerLenRes = false;
    if (lenRes < 8) {
      lenRes = strlen(inputscanf);
      isIterSmallerLenRes = uVar1 < lenRes;
    }
    if (!isIterSmallerLenRes) break;
    mettrea0 = inputscanf[iterator];
    local_3c = inputscanf[iterator + 1];
    local_3b = inputscanf[iterator + 2];
    tmp[0] = mettrea0;
    tmp[1] = local_3c;
    tmp[2] = local_3b;
    isSame = atoi(tmp);
    res[index8] = (char)isSame;
    iterator = iterator + 3;
    index8 = index8 + 1;
  }
  res[index8] = '\0';
  isSame = strcmp(res,"delabere");
  if (isSame == 0) {
    ok();
  }
  else {
    no();
  }
  return 0;
}