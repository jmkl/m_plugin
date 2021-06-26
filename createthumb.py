from PIL import Image
import os, PIL, glob,sys
from os import walk
import server
import wx
import wx.adv
import http.server
import socketserver
import os
import threading

TRAY_ICON = 'J:\\__CODE\\PHOTOSHOP\\utility-mix\\icons\\dark@1x.png'
TRAY_TOOLTIP = 'Name' 
PORT = 8001

web_dir = "J:/texturelabs/thumb"#os.path.join(os.path.dirname(__file__), 'web')
os.chdir(web_dir)





def createThumb():
    fixed_height =50
    root = "J:\\texturelabs"
    thumbdir = "J:\\texturelabs\\thumb"
    thumbs = os.listdir(thumbdir)

    files =  os.listdir(root)
    for name in files:    
        if(os.path.isfile(os.path.join(root,name)) and len(files)-1 > len(thumbs) and os.path.isfile(os.path.join(thumbdir,name))==False):
            
            image = Image.open(os.path.join(root,name))        
            height_percent = (fixed_height/float(image.size[1]))
            width_size = int((float(image.size[0]) * float(height_percent)))
            image = image.resize((width_size, fixed_height), PIL.Image.NEAREST)
            image.save(os.path.join(root,"thumb",name))





def create_menu_item(menu, label, func):
    item = wx.MenuItem(menu, -1, label)
    menu.Bind(wx.EVT_MENU, func, id=item.GetId())
    menu.Append(item)
    return item


class TaskBarIcon(wx.adv.TaskBarIcon):
    
    def __init__(self, frame,httpd,thread):
        self.frame = frame
        self.httpd = httpd
        self.text = "Hello"
        self.thread = thread
        super(TaskBarIcon, self).__init__()
        self.set_icon(TRAY_ICON)
        self.Bind(wx.adv.EVT_TASKBAR_LEFT_DOWN, self.on_left_down)
        
        

    def CreatePopupMenu(self):
        menu = wx.Menu()
        self.itemmenu = create_menu_item(menu, self.text, self.on_hello)
        menu.AppendSeparator()
        create_menu_item(menu, 'Exit', self.on_exit)
        return menu

    def set_icon(self, path):
        icon = wx.Icon(path)
        self.SetIcon(icon, TRAY_TOOLTIP)

    def on_left_down(self, event):      
        pass

    def on_hello(self, event):
        pass

    def on_exit(self, event):
        wx.CallAfter(self.Destroy)
        self.httpd.shutdown()
        self.httpd.server_close()            
        self.frame.Close()
        
        
    def setText(self,msg):
        self.text = msg

class App(wx.App):
    Handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    mthread = threading.Thread(target=httpd.serve_forever)
    def OnInit(self):
        frame=wx.Frame(None)
        self.SetTopWindow(frame)
        self.tbicon = TaskBarIcon(frame,self.httpd,self.mthread)
        return True
    def setText(self,msg):
        self.tbicon.setText(msg)
    def startServer(self):
        createThumb()
        self.tbicon.setText('listening on port :'+str(PORT))
        self.mthread.start()
        

def main():
    app = App(False)    
    
    app.startServer()
    app.MainLoop()      
    


if __name__ == '__main__':
    main()