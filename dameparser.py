import StringIO
class Node:
    def GetNodeText(node):
        return ""
    def ParseAttribute(node):
        return {}
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
            if ("__extlinknum__" in rootnode.__dict__) == False:
                rootnode.__extlinknum__ = 0
            rootnode.__extlinknum__ = rootnode.__extlinknum__ + 1
            show_text = "[" + str(rootnode.__extlinknum__) + "]"
        self.show_text = show_text

class RefNode:
    def __init__(self):
        self.children = []
        self.group = ""
    def process(self,rootnode):        
        options = Node.ParseAttribute(self.children[0])
        t =Node.GetNodeText(self.children[0])
        t = t[t.find(">")+1:]
        
        self.children[0].text = t
        t = Node.GetNodeText(self.children[-1])
        t = t[:t.find("/")]
        if t.find("<") != -1:
            t = t[:t.find("<")]
        self.children[-1].text = t
        
        for it in self.children:
            it.process(rootnode)
        

        if ("__ref__" in rootnode.__dict__) == False:
            rootnode.__ref__ = list()
        name = ""
        isfinish = False
        self.name = name
        if "group" in options:
            self.group = options["options"]
        if "name" in options:
            name = options["name"]
            for ref in rootnode.__ref__:
                if ref["name"] == self.name:
                    ref["nodes"].append(self)
                    isfinish = True
                    pass
            if isfinish:
                item = dict()
                item["contents"] = self.children
                item["name"] = name
                item["nodes"] = list()
                item["nodes"].append(self)
                rootnode.__ref__.append(self)
        else:
            item = dict()
            item["contents"] = self.children
            item["name"] = name
            item["nodes"] = list()
            item["nodes"].append(self)
            rootnode.__ref__.append(self)
        pass
    pass
class ReferenceNode:
    def __init__(self):
        self.children = {}
    def process(self,rootnode):
            text = Node.GetNodeText(self)
            options = Node.ParseAttribute(text)
            refchildren = []
            others = {}
            if "group" in options:
                #TODO:그룹처리
                group = options["group"]
                if ("__ref__" in rootnode.__dict__) == False:
                    rootnode.__ref__ = dict()
                for it in rootnode.__ref__ :
                    iter = rootnode.__ref__[it]
                    if iter["refs"][0].group == group:
                        refchildren[it] =iter
                    else:
                        others[it] = iter
                
        pass
    pass
