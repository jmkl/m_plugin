from PIL import Image
import os, PIL, glob
from os import walk

# image = Image.open("texturelab/Texturelabs_Atmosphere_126XL.jpg")
# print(image.size)
fixed_height =60
root = "J:\\texturelabs"
files =  os.listdir(root)
for name in files:    
    if(os.path.isfile(os.path.join(root,name))):
        
        image = Image.open(os.path.join(root,name))        
        height_percent = (fixed_height/float(image.size[1]))
        width_size = int((float(image.size[0]) * float(height_percent)))
        image = image.resize((width_size, fixed_height), PIL.Image.NEAREST)
        image.save(os.path.join(root,"thumb",name))
