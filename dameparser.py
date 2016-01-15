import StringIO
class Node:
    def GetNodeText(node):
        return ""
class NowikiNode:
    def __init__(self):
        self.children = []
    def process(self,rootnode):
        innerText = StringIO.StringIO()
        for child in self.children:
            innerText.write(Node.GetNodeText(child))
        self.text = innerText.getvalue()
        self.text = self.text.replace("<","&lt;")
        self.text = self.text.replace(">","&gt;")
        self.children = []
class TextNode:
    def __init__(self,text):
        self.text = text
    def process(self,rootnode):
        pass
class BRNode:
    def __init__(self):
        self.children = []
class LinkNode:
    def __init__(self):
        self.linktype = "LINK"
        self.children = []
    def process(self,rootnode):
        text = Node.GetNodeText(self)
        text = text[2:-2]
        if text[:3] == "파일:":
            self.linktype = "FILE"
        link_args = text.split("|")
        self.options = link_args[1:]
        self.linkpage = link_args[0]
        if ("__links__" in rootnode.__dict__) == False:
            rootnode.__links__ = dict()
        #해당 링크의 페이지가 있는지 확인할 것임
        rootnode.__links__[self.linkpage] = False
        
        
class ExtLinkNode:
    def __init__(self):
        self.children = []
    def process(self,rootnode):
        text = Node.GetNodeText(self)
        text = text[1:-1]
        text = text.trim()
        args = text.split(" ")
        show_text = ""
        self.url = args[0]
        if len(args) >= 2:
            show_text = args[1]
        if len(show_text) == 0:
            if "__extlinknum__" in rootnode:
                rootnode.__extlinknum__ = 0
            rootnode.__extlinknum__ = rootnode.__extlinknum__ + 1
            show_text = "[" + str(rootnode.__extlinknum__) + "]"
        self.show_text = show_text
    
        