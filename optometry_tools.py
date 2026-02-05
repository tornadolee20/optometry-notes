# Optometry Calculations

def calculate_transposition(sphere, cylinder, axis):
    """
    將眼鏡處方進行正負散光轉換 (Transposition)
    """
    new_sphere = sphere + cylinder
    new_cylinder = -cylinder
    new_axis = (axis + 90) % 180
    if new_axis == 0: new_axis = 180
    return new_sphere, new_cylinder, new_axis

# 測試：-2.00 -1.00 x 90 -> -3.00 +1.00 x 180
print(calculate_transposition(-2.0, -1.0, 90))
