with open('generate_packs.py', 'r', encoding='utf-8') as f:
    code = f.read()

patch = '''
    words_data = pack["data"].split("|")
    if pack_id == "animals":
        words_data += "Panda:Bamboo,Bear,China|Lemur:Madagascar,Ring,Tail|Meerkat:Stand,Desert,Timon|Baboon:Ape,Red,Bottom|Wolverine:Fierce,Claws,Wild".split("|")
    if pack_id == "campus-life":
        words_data += "Roommate:Share,Dorm,Live".split("|")
    if pack_id == "food":
        words_data += "Pretzel:Twist,Salt,Bake|Popcorn:Movie,Snack,Butter".split("|")
    
    words_data = [w for w in words_data if w.strip()]
    words_data = words_data[:120]
'''
code = code.replace('words_data = pack["data"].split("|")', patch)

with open('generate_packs2.py', 'w', encoding='utf-8') as f:
    f.write(code)
