import StringIO
class Node:
    @staticmethod
    def __getnodetext__(node):
        if type(node) is TextNode:
            return node.text
        else:
            buffer = StringIO.StringIO()
            for n in node.children:
                buffer.write(Node.__getnodetext__(n))
            return buffer.getvalue()
    @staticmethod
    def GetNodeText(node):
        return Node.__getnodetext__(node)
    @staticmethod
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
    def process(self,rootnode):
        pass
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
        self.children = []
    def process(self,rootnode):
            text = Node.GetNodeText(self)
            options = Node.ParseAttribute(text)
            refchildren = []
            others = {}
            if "group" in options:
                #TODO:그룹처리
                group = options["group"]
            else:
                group = ""
            if ("__ref__" in rootnode.__dict__) == False:
                rootnode.__ref__ = dict()
            for it in rootnode.__ref__ :
                iter = rootnode.__ref__[it]
                if iter["refs"][0].group == group:
                    refchildren[it] =iter
                else:
                    others[it] = iter
            rootnode.__ref__ = others
        
        pass
    pass
class HeadingNode:
    def __init__(self):
        self.children = []
    def process(self,rootnode):
        start_node_text = Node.GetNodeText(self.children[0])
        end_node_text = Node.GetNodeText(self.children[-1])
        start_lv = 0
        for ch in start_node_text:
            if ch == "=":
                start_lv = start_lv + 1
            else:
                break
        end_lv = 0
        for ch in end_node_text:
            if ch == "=":
                end_lv = end_lv + 1
            else:
                break
        heading_node_lv = min(start_lv,end_lv)
        self.headinglevel = heading_node_lv
        self.children[0].text = start_node_text[start_lv:]
        self.children[-1].text = end_node_text[:end_lv * -1]
        for it in self.children:
            it.process(rootnode)
class BoldNode:
    def __init__(self):
        self.children = []
    def process(self, rootnode):
        start_node_text = Node.GetNodeText(self.children[0])
        end_node_text = Node.GetNodeText(self.children[-1])
        self.children[0].text = start_node_text[3:]
        self.children[-1].text = end_node_text[:-3]
        for it in self.children:
            it.process(rootnode)
        pass
    pass
class ItalicNode:
    def __init__(self):
        self.children = []
    def process(self, rootnode):
        start_node_text = Node.GetNodeText(self.children[0])
        end_node_text = Node.GetNodeText(self.children[-1])
        self.children[0].text = start_node_text[2:]
        self.children[-1].text = end_node_text[:-2]
        for it in self.children:
            it.process(rootnode)
        pass
    pass
class BoldItalicNode:
    def __init__(self):
        self.children = []
    def process(self, rootnode):
        start_node_text = Node.GetNodeText(self.children[0])
        end_node_text = Node.GetNodeText(self.children[-1])
        self.children[0].text = start_node_text[5:]
        self.children[-1].text = end_node_text[:-5]
        for it in self.children:
            it.process(rootnode)
        pass
    pass
class CellNode:
    def __init__(self,ishead = False):
        self.ishead = ishead
        self.attribute = ""
        self.children = []
    def process(self,rootnode):
        for iter in self.children:
            iter.process(rootnode)
        pass

class RowNode:
    def __init__(self):
        self.children = []
        self.rows = []
        self.attribute = ""
    def process(self,rootnode):
        for iter in self.children:
            iter.process(rootnode)
        pass
class TableNode:
    def __init__(self):
        self.children = []
    def process(self,rootnode):
        posprebar = -1
        j = -1
        isstartcell = 0
        rownode = None
        cellnode = None
        t = Node.GetNodeText(self.children[0])
        t = t[2:]
        cridx = t.find("\n")
        if cridx is not -1:
            self.tableattr = t[0:cridx]
            self.children[0].text = t
        t = Node.GetNodeText(self.children[-1])
        t = t[:-2]
        self.children[-1].text = t
        for node in self.children:
            if type(node) is TextNode:
                posprebar = 0
                i = 0
                t = node.text
                while i < len(t):
                    if t[i:i+2] == "|-":
                        isstartcell = 0
                        if row is not None:
                            self.rows.append(row)
                        row = RowNode()
                        i = i + 2
                        cridx = t.find("\n",i)
                        
                        if cridx != -1:
                            row.attribute = t[i:cridx]
                            i = cridx
                    else:
                        ch = t[i]
                        if ch is "!" or ch is "|":
                            if row is None:
                                row = RowNode()
                        if ch is "!":
                            if isstartcell is 0:
                                if t[i+1] is "!":
                                    isstartcell = 2
                                    i = i + 1
                                else:
                                    isstartcell = 1
                                posprebar = i
                                cellnode = CellNode(True)
                                row.children.append(cellnode)
                            elif isstartcell is 1:
                                if t[i - 1] == "!":
                                    isstartcell = 2
                                    posprebar = i
                            elif isstartcell is 2:
                                posprebar = posprebar + 1
                                
                        