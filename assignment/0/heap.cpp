
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

#define TYPE int
#define MAX_SIZE 1024

class Heap
{
private:
    TYPE heap[MAX_SIZE];

    void heapify(int index)
    {
        int left = index * 2 + 1;
        int right = index * 2 + 2;
        int maxInd = index;

        if (left < size && heap[left] > heap[maxInd])
        {
            maxInd = left;
        }
        if (right < size && heap[right] > heap[maxInd])
        {
            maxInd = right;
        }
        if (maxInd != index)
        {
            swap(index, maxInd);
            heapify(maxInd);
        }
    }

    void shiftUp(int index)
    {
        if (index <= 0)
        {
            return;
        }
        int father = (index - 1) / 2;

        if (heap[index] > heap[father])
        {
            swap(index, father);
            shiftUp(father);
        }
    }

    void swap(int index1, int index2)
    {
        TYPE temp;
        temp = heap[index1];
        heap[index1] = heap[index2];
        heap[index2] = temp;
    }

public:
    int size;

    /** Initialize data structure
     * Set the size of the heap to be n. */
    Heap()
    {
        size = 0;
    }

    /** Insert an element into the heap. 
     *  Return true if the operation is successful. */
    bool insert(TYPE value)
    {
        if (isFull())
        {
            return false;
        }
        else
        {
            heap[size] = value;
            shiftUp(size++);
            return true;
        }
    }

    /** Delete an element from the heap.
     *  Return poped value if the operation is successful. 
     * */
    TYPE remove()
    {
        if (!isEmpty())
        {
            swap(0, --size);
            heapify(0);
            return heap[size];
        }
    }

    bool isEmpty()
    {
        return size == 0;
    }

    bool isFull()
    {
        return size == MAX_SIZE;
    }

    friend std::ostream &operator<<(std::ostream &output,
                                    Heap &h)
    {
        if (h.isEmpty())
        {
            output << "Empty";
            return output;
        }
        output << "bottom-> ";
        for (int i = 0; i < h.size; i++)
        {
            output << h.heap[i] << " ";
        }
        output << "->top";
        return output;
    }
};

int main()
{
    Heap heap;
    int n;
    TYPE temp;

    cout << "enter the size of the stack: ";
    cin >> n;

    cout << "enter the items: ";
    for (int i = 0; i < n; i++)
    {
        cin >> temp;
        heap.insert(temp);
        cout << "heap content: " << heap << endl;
    }

    for (int i = 0; i < n; i++)
    {
        cout << heap.remove() << " "; //输出堆顶元素
    }

    return 0;
}
