
import sys

def extract_text(file_path):
    try:
        import zlib
        import re

        with open(file_path, 'rb') as f:
            content = f.read()

        # Find all streams
        stream_matches = re.finditer(b'stream\r?\n(.*?)\r?\nendstream', content, re.DOTALL)
        text_content = ""
        
        for match in stream_matches:
            stream_data = match.group(1)
            try:
                # Try to decompress
                decompressed = zlib.decompress(stream_data)
                # Look for text-like patterns ( Tj, TJ )
                decoded = decompressed.decode('utf-8', errors='ignore')
                text_content += decoded
            except:
                continue
        
        return text_content
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    print(extract_text(sys.argv[1]))
