from PIL import Image
import os,PIL
import base64,os,json
def crop_image(image):
    width, height = image.size
    if width == height:
        return image
    offset  = int(abs(height-width)/2)
    if width>height:
        image = image.crop([offset,0,width-offset,height])
    else:
        image = image.crop([0,offset,width,height-offset])
    return image
def createThumb():
    fixed_height =120
    root = "J:\\texturelabs"
    thumbdir = "J:\\texturelabs\\thumb"
    thumbs = os.listdir(thumbdir)

    files =  os.listdir(root)

    for name in files:    
        if(os.path.isfile(os.path.join(root,name)) and len(files)-1 > len(thumbs) and os.path.isfile(os.path.join(thumbdir,name))==False):
            
            image = Image.open(os.path.join(root,name))
            image = crop_image(image)
            image = image.resize((fixed_height, fixed_height), PIL.Image.NEAREST)
            image.save(os.path.join(root,"thumb",name))

def generatebase64():
    imagedata = list()
    for image in os.listdir("J:/texturelabs/thumb/"):
        with open(os.path.join("J:/texturelabs/thumb/",image), "rb") as image_file:
            data = base64.b64encode(image_file.read())
            my_dic = {'base64':(data).decode('utf-8'),'name':image,'ext':os.path.splitext(image)[1][1:]}
            imagedata.append(my_dic)

    with open("J:/texturelabs/thumb/data.json","w") as f:
        json.dump(imagedata,f)


if __name__ == "__main__":
    createThumb()
    generatebase64()