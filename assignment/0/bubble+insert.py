import random


class BubbleSort:

    def __init__(self, iterable, less_than=lambda x, y: x < y):
        self.array = [x for x in iterable]
        self.lt = less_than

    def sort(self):

        for i in range(len(self.array)):
            for j in range(len(self.array)-1-i):

                if not self.lt(self.array[j], self.array[j+1]):
                    self.array[j], self.array[j+1] = \
                        self.array[j+1], self.array[j]

        return self.array


class InsertSort:

    def __init__(self, iterable, less_than=lambda x, y: x < y):
        self.array = [x for x in iterable]
        self.lt = less_than

    def sort(self):
        for i in range(1, len(self.array)):
            current = self.array[i]
            j = i
            while self.lt(current, self.array[j-1]):
                self.array[j] = self.array[j-1]
                j -= 1
                if j == 0:
                    break
            self.array[j] = current

        return self.array


array1 = [1, 5, 6, 3, 5, 8, 0, 7]
array2 = [random.randint(1, 50) for i in range(50)]

bs = BubbleSort(array1)
print("bs1: ", bs.sort())
insertSort = InsertSort(array1)
print("is1: ", insertSort.sort())

bs = BubbleSort(array2)
print("bs2: ", bs.sort())
insertSort = InsertSort(array2)
print("is2: ", insertSort.sort())
