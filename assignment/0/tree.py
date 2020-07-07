
class Node:
    def __init__(self, value):
        self.value = value
        self.lChild = None
        self.rChild = None

    def addChild(self, value, direction='l'):
        if direction == 'l':
            self.lChild = Node(value)
            return self.lChild
        else:
            self.rChild = Node(value)
            return self.rChild


tree = Node(1)
level2 = tree.addChild(2, "l")
level3 = level2.addChild(4, "l")
level4 = level2.addChild(5, "r").addChild(7, "l")
tree.addChild(3, "r").addChild(6, "l")


def showTree():
    treeStr = '''
        1
      /   \\
     2     3
    / \   /
   4   5 6 
      /
     7 
 '''
    print("the tree looks like: ", treeStr)
