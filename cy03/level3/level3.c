#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>



void ____syscall_malloc(void)
{
  puts("Good job.");
  return;
}


void ___syscall_malloc(void)
{
  puts("Nope.");
                    /* WARNING: Subroutine does not return */
  exit(1);
}


int main(void)
{
  unsigned long uVar1;
  int iVar2;
  size_t resLen;
  bool bVar3;
  char local_4c;
  char local_4b;
  char local_4a;
  char inputscanf [31];
  char res [9];
  unsigned long i3;
  int local_18;
  int i;
  int local_10;
  char tmp[3];


  printf("Please enter key: ");
  local_10 = scanf("%s", inputscanf);
  if (local_10 != 1) {
    ___syscall_malloc();
  }
  if (inputscanf[1] != '2') {
    ___syscall_malloc();
  }
  if (inputscanf[0] != '4') {
    ___syscall_malloc();
  }
  fflush(stdin);
  memset(res,0,9);
  res[0] = '*';
  i3 = 2;
  i = 1;
  while( true ) {
    resLen = strlen(res);
    uVar1 = i3;
    bVar3 = false;
    if (resLen < 8) {
      resLen = strlen(inputscanf);
      bVar3 = uVar1 < resLen;
    }
    if (!bVar3) break;
    local_4c = inputscanf[i3];
    local_4b = inputscanf[i3 + 1];
    local_4a = inputscanf[i3 + 2];
    tmp[0] = local_4c;
    tmp[1] = local_4b;
    tmp[2] = local_4a;
    iVar2 = atoi(tmp);
    res[i] = (char)iVar2;
    i3 = i3 + 3;
    i = i + 1;
  }
  res[i] = '\0';
  local_18 = strcmp(res,"********");
  if (local_18 == -2) {
    ___syscall_malloc();
  }
  else if (local_18 == -1) {
    ___syscall_malloc();
  }
  else if (local_18 == 0) {
    ____syscall_malloc();
  }
  else if (local_18 == 1) {
    ___syscall_malloc();
  }
  else if (local_18 == 2) {
    ___syscall_malloc();
  }
  else if (local_18 == 3) {
    ___syscall_malloc();
  }
  else if (local_18 == 4) {
    ___syscall_malloc();
  }
  else if (local_18 == 5) {
    ___syscall_malloc();
  }
  else if (local_18 == 0x73) {
    ___syscall_malloc();
  }
  else {
    ___syscall_malloc();
  }
  return 0;
}

