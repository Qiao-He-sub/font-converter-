import sys
from fontTools.ttLib import TTFont
from fontTools.ttx import makeOutputFileName
import os

input_path = sys.argv[1]
output_path = sys.argv[2]
output_ext = output_path.split('.')[-1].lower()

try:
    if output_ext in ['ttf', 'otf']:
        font = TTFont(input_path)
        font.save(output_path)
    elif output_ext == 'woff':
        font = TTFont(input_path)
        font.flavor = 'woff'
        font.save(output_path)
    elif output_ext == 'woff2':
        font = TTFont(input_path)
        font.flavor = 'woff2'
        font.save(output_path)
    elif output_ext in ['pfa', 'pfb']:
        try:
            from fontTools import t1Lib
            t1Lib.convert(input_path, output_path)
        except ImportError:
            print('Type1 字体转换需要 fontTools[t1] 支持', file=sys.stderr)
            sys.exit(1)
    else:
        print('不支持的目标格式: {}'.format(output_ext), file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'字体转换异常: {e}', file=sys.stderr)
    sys.exit(1) 