
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

#define TYPE int
#define MAX_SIZE 1024

class MyStack
{
private:
    TYPE stack[MAX_SIZE];
    int top;

public:
    /** Initialize data structure
     * Set the size of the stack to be n. */
    MyStack()
    {
        top = -1;
    }

    /** Insert an element into the stack. 
     *  Return true if the operation is successful. */
    bool push(TYPE value)
    {
        if (isFull())
        {
            return false;
        }
        else
        {
            top++;
            stack[top] = value;
            return true;
        }
    }

    /** Delete an element from the stack.
     *  Return poped value if the operation is successful. 
     *  return false if the operation fails
     * */
    TYPE pop()
    {
        if (!isEmpty())
        {
            return stack[top--];
        }
    }

    int size()
    {
        return top + 1;
    }

    bool isEmpty()
    {
        return size() == 0;
    }

    bool isFull()
    {
        return (size() == MAX_SIZE - 1);
    }

    friend std::ostream &operator<<(std::ostream &output,
                                    MyStack &s)
    {
        if (s.isEmpty())
        {
            output << "Empty";
            return output;
        }
        output << "bottom-> ";
        for (int i = 0; i < s.size(); i++)
        {
            output << s.stack[i] << " ";
        }
        output << "->top";
        return output;
    }
};

int main()
{
    MyStack stack;
    int n;
    TYPE temp;

    cout << "enter the size of the stack: ";
    cin >> n;

    cout << "enter the items: ";
    for (int i = 0; i < n; i++)
    {
        cin >> temp;
        stack.push(temp);
    }

    cout << "stack size: " << stack.size() << endl;
    cout << "stack content: " << stack << endl;

    for (int i = 0; i < n; i++)
    {
        cout << stack.pop() << " "; //输出堆顶元素
    }

    return 0;
}
