
import random


class HeapSort:

    def __init__(self, iterable, less_than=lambda x, y: x < y):
        self.array = [x for x in iterable]
        self.lt = less_than
        self.len = len(self.array)

    def sort(self):
        if self.len <= 1:
            return self.array

        # build a max heap
        self.buildMaxHeap()

        # take the first element as the biggest
        # then remodify the rest of the heap
        for i in range(self.len-1, -1, -1):
            self.array[i], self.array[0] = self.array[0], self.array[i]
            self.len -= 1
            self.heapify(0)

        return self.array

    def buildMaxHeap(self):
        for i in range(self.len//2-1, -1, -1):
            self.heapify(i)

    def heapify(self, index):
        left = index*2+1
        right = index*2+2

        max_ind = index

        if left < self.len and self.array[left] > self.array[max_ind]:
            max_ind = left
        if right < self.len and self.array[right] > self.array[max_ind]:
            max_ind = right

        # if so, it shows that the tree needs to be modified
        if max_ind != index:
            self.array[index], self.array[max_ind] = self.array[max_ind], self.array[index]
            self.heapify(max_ind)


array1 = [1, 5, 6, 3, 5, 8, 0, 7]
array2 = [random.randint(1, 50) for i in range(50)]

hs = HeapSort(array1)
print("hs1: ", hs.sort())
hs = HeapSort(array2)
print("hs2: ", hs.sort())
