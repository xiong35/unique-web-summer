
import tree as t


def levelTraverse(tree):
    queue = [tree]
    while queue:
        cur = queue.pop(0)
        print(cur.value, end=' ')
        if cur.lChild:
            queue.append(cur.lChild)
        if cur.rChild:
            queue.append(cur.rChild)


t.showTree()

print("levelTraverse: ")
levelTraverse(t.tree)
