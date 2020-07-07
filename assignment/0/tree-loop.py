
import tree as t


def preTraverse(tree):
    stack = [tree]
    while stack:
        cur = stack.pop()
        if cur.__class__ is t.Node:
            stack.append(cur.rChild)
            stack.append(cur.lChild)
            stack.append(cur.value)
        elif cur.__class__ is int:
            print(cur, end=' ')


def postTraverse(tree):
    stack = [tree]
    while stack:
        cur = stack.pop()
        if cur.__class__ is t.Node:
            stack.append(cur.value)
            stack.append(cur.rChild)
            stack.append(cur.lChild)
        elif cur.__class__ is int:
            print(cur, end=' ')


def midTraverse(tree):
    stack = [tree]
    while stack:
        cur = stack.pop()
        if cur.__class__ is t.Node:
            stack.append(cur.rChild)
            stack.append(cur.value)
            stack.append(cur.lChild)
        elif cur.__class__ is int:
            print(cur, end=' ')


t.showTree()

print("preTraverse: ")
preTraverse(t.tree)

print("\n\npostTraverse: ")
postTraverse(t.tree)

print("\n\nmidTraverse: ")
midTraverse(t.tree)
