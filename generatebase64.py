import base64,os,json
from PIL import Image
from io import BytesIO

img = "J:/texturelabs/thumb/Texturelabs_Atmosphere_126XL.jpg"
imagedata = list()
for image in os.listdir("J:/texturelabs/thumb/"):
   with open(os.path.join("J:/texturelabs/thumb/",image), "rb") as image_file:
    data = base64.b64encode(image_file.read())
    my_dic = {'base64':(data).decode('utf-8'),'name':image,'ext':os.path.splitext(image)[1][1:]}
    imagedata.append(my_dic)

with open("J:/texturelabs/thumb/data.json","w") as f:
    json.dump(imagedata,f)



