import sys
import shutil
import os
import pipes
from PIL import Image
import json
import StringIO
import math
import json
import math

def extract_video(video_path, output_dir, framerate, width=400):
    ensure_clear_dir(output_dir)
    cmd = "ffmpeg -i {0} -vsync 1 -vf scale={3}:-1 -r {1} {2}".format(pipes.quote(video_path), framerate, pipes.quote(os.path.join(output_dir, '%03d.png')), width)
    os.system(cmd)

def create_spritesheet(video_path, output_path, framerate=13):
    temp_dir = 'temp'
    extract_video(video_path, temp_dir, framerate)
    frame_names = [name for name in os.listdir(temp_dir) if name.endswith('.png')]
    frame_names.sort(key=lambda name: int(name.split('.')[0]))
    frame_paths = [os.path.join(temp_dir, name) for name in frame_names]
    size = Image.open(frame_paths[0]).size
    # size = (int(size[0] * 0.25), int(size[1] * 0.25))
    count = len(frame_paths)
    columns = int(round(count ** 0.5))
    rows = int(math.ceil(count * 1.0 / columns))
    full_size = (size[0] * columns, size[1] * rows)
    sheet = Image.new('RGB', full_size)
    
    print json.dumps({"type": "video", "framerate": framerate, "count": len(frame_paths), "columns": columns, "rows": rows, "url": output_path})
    for i, frame_path in enumerate(frame_paths):
        image = Image.open(frame_path)
        image.thumbnail(size, Image.ANTIALIAS)
        col = i % columns
        row = i / columns
        sheet.paste(image, (col * size[0], row * size[1], (col+1) * size[0], (row+1) * size[1]))
    sheet.save(output_path, "JPEG", quality=20)

def ensure_clear_dir(path):
    if os.path.exists(path): shutil.rmtree(path)
    os.mkdir(path)

if __name__ == '__main__':
    create_spritesheet(sys.argv[1], sys.argv[2])
