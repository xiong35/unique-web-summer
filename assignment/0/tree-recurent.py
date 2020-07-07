
import tree as t


def preTraverse(tree):
    if not tree:
        return
    print(tree.value, end=' ')
    preTraverse(tree.lChild)
    preTraverse(tree.rChild)


def postTraverse(tree):
    if not tree:
        return
    postTraverse(tree.lChild)
    postTraverse(tree.rChild)
    print(tree.value, end=' ')


def midTraverse(tree):
    if not tree:
        return
    midTraverse(tree.lChild)
    print(tree.value, end=' ')
    midTraverse(tree.rChild)


t.showTree()

print("preTraverse: ")
preTraverse(t.tree)

print("\n\npostTraverse: ")
postTraverse(t.tree)

print("\n\nmidTraverse: ")
midTraverse(t.tree)
