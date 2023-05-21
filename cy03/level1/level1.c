#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main()
{
  int iVar1;
  char local_70[100];
  char *local_7e = "__stack_check";
  printf("Please enter key: ");
  fflush(stdout);
  scanf("%s", local_70);
  iVar1 = strcmp(local_70, local_7e);
  if (iVar1 == 0)
  {
    printf("Good job.\n");
  }
  else
  {
    printf("Nope.\n");
  }
  return 0;
}