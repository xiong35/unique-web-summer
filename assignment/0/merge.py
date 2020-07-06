
import random


class MergeSort:

    def __init__(self, iterable, less_than=lambda x, y: x < y):
        self.array = iterable
        self.lt = less_than

    def sort(self):
        return self._sort(self.array)

    def _sort(self, arr):
        if len(arr) == 1:
            return arr

        mid = len(arr)//2
        sorted_lhs = self._sort(arr[:mid])
        sorted_rhs = self._sort(arr[mid:])

        return_arr = []

        # pointer left/right
        pt_l = 0
        pt_r = 0

        while True:
            if self.lt(sorted_lhs[pt_l], sorted_rhs[pt_r]):
                return_arr.append(sorted_lhs[pt_l])
                pt_l += 1
            else:
                return_arr.append(sorted_rhs[pt_r])
                pt_r += 1
            if len(sorted_rhs) == pt_r or len(sorted_lhs) == pt_l:
                break

        return_arr.extend(sorted_lhs[pt_l:])
        return_arr.extend(sorted_rhs[pt_r:])

        return return_arr


array1 = [1, 5, 6, 3, 5, 8, 0, 7]
array2 = [random.randint(1, 50) for i in range(50)]

ms = MergeSort(array1)
print("ms1: ", ms.sort())
ms = MergeSort(array2)
print("ms2: ", ms.sort())
