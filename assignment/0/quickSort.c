
#include <stdbool.h>
#include <stdio.h>

int mySwap(void *lhs, void *rhs, int sz)
{
    //compare(a,b) : (a is in the front of b) => ture
    void *temp = malloc(sz);
    if (!temp)
        return -1;

    memcpy(temp, lhs, sz);
    memcpy(lhs, rhs, sz);
    memcpy(rhs, temp, sz);

    free(temp);

    return 0;
}

void myQS(void *arr, int num, int size, bool (*compare)(void *pa, void *pb))
{
    //compare(a,b) : (a is in the front of b) => ture

    //num == 1; return;
    if (num == 1)
    {
        return;
    }

    //take the first as model
    void *pleft, *pright;
    pleft = arr;
    pright = (void *)((char *)arr + (num - 1) * size);

    //while 2 pts havent met
    while (pleft != pright)
    {
        //r2l find one
        while (compare(arr, pright) && pleft != pright)
        //compare(a,b) : (a is in the front of b) => ture
        //keep finding, if *pright is latter than model
        {
            pright = (void *)((char *)pright - size);
        }
        //l2r find  another
        while (compare(pleft, arr) && pleft != pright)
        //compare(a,b) : (a is in the front of b) => ture
        //keep finding, if *pleft is former than model
        {
            pleft = (void *)((char *)pleft + size);
        }
        //swap
        mySwap(pleft, pright, size);
    }

    //swap with the first one
    mySwap(pleft, arr, size);

    //calculate the num of elements in lhs, rhs.
    int num_of_lhs = ((char *)pleft - (char *)arr) / size;
    int num_of_rhs = num - num_of_lhs - 1;

    //QS lhs
    if (num_of_lhs)
    {
        myQS(arr, num_of_lhs, size, compare);
    }
    //QS rhs
    if (num_of_rhs)
    {
        myQS((void *)((char *)pleft + size), num_of_rhs, size, compare);
    }

    return;
}

bool less_than(void *pa, void *pb)
{
    return *((int *)pa) < *((int *)pb);
}

int main(void)
{
    int array[7];
    for (int i = 0; i < 7; i++)
    {
        array[i] = (i * 77) % 13;
        printf("%d ", array[i]);
    }

    myQS((void *)array, 7, sizeof(int), less_than);

    printf("\n");
    for (int i = 0; i < 7; i++)
    {
        printf("%d ", array[i]);
    }

    return 0;
}