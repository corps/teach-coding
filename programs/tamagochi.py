TICKS_PER_UPDATE = 8
TICKS_PER_FRAME = 3
MAX_HEALTH = 100
MAX_HUNGER = 100
MAX_SLEEPINESS = 20
MAX_DIGESTION = 100
MAX_HAPPINESS = 100
GRUMPY_THRESHOLD = 20

# The ANIMATIONS value contains all the entries from lines 6 to 16.
# The left side of the equals is the name of the animation.  When you call
# animate_sprite, you should provide a string matching this name.
#  eg.  sleep=[....] => animate_sprite("sleep", ...)
ANIMATIONS = dict(
  poo=["poo1.png", "poo2.png", "poo3.png"],
  candy=["candy1.png", "candy2.png", "candy3.png", "candy4.png", "candy5.png", "candy6.png"],
  food=["food1.png", "food2.png", "food3.png", "food4.png", "food5.png", "food6.png"],
  sleep=["sleep3.png", "sleep2.png", "sleep1.png"],
  eat=["tama6.png", "tama10.png"],
  squash=["tama9.png", "tama15.png", "tama11.png", "tama12.png", "tama7.png"],
  anger=["anger1.png", "anger2.png", "anger3.png"],
  complain=["tama13.png", "tama8.png", "tama4.png"],
  left=["tama3.png"],
  right=["tama2.png"],
  joy=["tama1.png", "tama16.png"],
)

# models how "healthy" the tamagotchi is.  When it reaches 0,
# the tamagotchi dies :OOO
health = MAX_HEALTH

# models how hungry the tamagotchi is.  hunger will go up until
# it reaches MAX_HUNGER, # after which the tamagotchi will become
# upset and unhealthy unless fed.
hunger = 0
digestion = 0
has_poo = False
happiness = MAX_HAPPINESS
is_asleep = False
sleepiness = 0

# models the position of the tamagotchi as it moves on thes creen.
# Remember, in computer coordinations, smaller x values are to the left,
# larger to the right, while smaller y values are to the top, and large to
# the bottom.
x = 150
y = 150

# Feel free to name your tamagotchi by changing this value!
name = "Tama"

# This is special for the program, don't worry too much about it.
acitivity = iter([])


### utility functions
def trace(label, value):
  print(label + ": " + repr(value))
  return value


def animate_sprite(sprite_name, animation_name, loops=1):
  for i in range(loops):
    for frame in ANIMATIONS[animation_name]:
      for i in range(TICKS_PER_FRAME):
        draw_sprite(sprite_name, frame)
        yield


def wait(ticks):
  for i in range(ticks):
    yield


def start_activity(new_activity):
  global activity

  remove_sprite("emotion")
  remove_sprite("candy")
  remove_sprite("food")

  activity = zip(update_tama(), new_activity(), draw_hearts(), animate_poo())

### game logic

def update_tama():
  global health, hunger, digestion, happiness, age, activity, is_asleep, sleepiness, has_poo

  while health > 0:
    write("status", name + " is well.")
    if happiness < GRUMPY_THRESHOLD:
      write("status", name + " is grumpy!")

    if hunger > MAX_HUNGER / 2:
      write("status", name + " is hungry...")

    if sleepiness > MAX_SLEEPINESS * 3 / 4:
      write("status", name + " is sleepy...")

    yield from wait(TICKS_PER_UPDATE)

    if not is_asleep:
      sleepiness = sleepiness + 1

    if sleepiness > MAX_SLEEPINESS and not is_asleep:
      is_asleep = True
      start_activity(sleep)

    happiness = happiness - random_int(0, 2)

    if digestion < MAX_DIGESTION:
      digestion = digestion + random_int(0, 2)
    else:
      if not has_poo and not is_asleep:
        move_sprite("poo", x, y)
        has_poo = True
        digestion = 0

    if has_poo:
      health = health - random_int(1, 8)

    if hunger < MAX_HUNGER:
      hunger = hunger + random_int(5, 15)
    else:
      health = health - random_int(1, 3)
      happiness = happiness - random_int(5, 20)

    if happiness < 0:
      happiness = 0

    if happiness > GRUMPY_THRESHOLD and hunger < MAX_HUNGER and not has_poo and health < MAX_HEALTH:
      health = health + random_int(0, 3)

  next(draw_hearts())
  draw_sprite("tama", "death.png")


def draw_hearts():
  global health

  move_sprite("heart1", 10, 10)
  move_sprite("heart2", 30, 10)
  move_sprite("heart3", 50, 10)
  move_sprite("heart4", 70, 10)
  move_sprite("heart5", 90, 10)

  while True:
    if health > 80:
      draw_sprite("heart5", "heart2.png")
    else:
      draw_sprite("heart5", "heart1.png")

    if health > 60:
      draw_sprite("heart4", "heart2.png")
    else:
      draw_sprite("heart4", "heart1.png")

    if health > 40:
      draw_sprite("heart3", "heart2.png")
    else:
      draw_sprite("heart3", "heart1.png")

    if health > 20:
      draw_sprite("heart2", "heart2.png")
    else:
      draw_sprite("heart2", "heart1.png")

    if health > 0:
      draw_sprite("heart1", "heart2.png")
    else:
      draw_sprite("heart1", "heart1.png")

    yield


def animate_poo():
  global has_poo

  poo_animation = animate_sprite("poo", "poo", 100000)

  while True:
    if has_poo:
      next(poo_animation)
      yield
    else:
      remove_sprite("poo")
      yield


def walk():
  global happiness, x, y

  move_sprite("tama", x, y)
  yield from animate_sprite("tama", "joy")

  while True:
    if happiness < GRUMPY_THRESHOLD:
      if random_int(1, 3) == 3:
        move_sprite("emotion", x + 5, y - 19)
        yield from zip(animate_sprite("emotion", "anger"), animate_sprite("tama", "complain"))
        remove_sprite("emotion")

    # random_int(0,1) => a number between 0 and 1 (1 inclusive)
    # this will be similar to a coin flip.
    # 50% of the time it will be 0, 50% of the time it be 1.
    left_or_right = random_int(0, 1)

    # random_int(0,1) => a number between 0 and 2 (2 inclusive)
    # In our case, we check for 0 as up, 1 as down, and do not check for 2.
    # for a value of 2, we will not move the sprite in the vertical direction
    # at all.
    up_or_down = random_int(0, 2)

    # go up
    if up_or_down == 0 and y >= 75:
      y = y - 25
      move_sprite("tama", x, y)

    # go down
    if up_or_down == 1 and y <= 250:
      y = y + 25
      move_sprite("tama", x, y)

    # go left
    if left_or_right == 0 and x >= 50:
      x = x - 25
      move_sprite("tama", x, y)
      yield from animate_sprite("tama", "left")

    # go right
    if left_or_right == 1 and x <= 250:
      x = x + 25
      move_sprite("tama", x, y)
      yield from animate_sprite("tama", "right")


def consume_food(hunger_rate, digestion_rate, happiness_rate):
  global hunger, digestion, happiness

  while True:
    yield from wait(TICKS_PER_FRAME)
    hunger = hunger + hunger_rate
    digestion = digestion + digestion_rate
    happiness = happiness + happiness_rate

    # Handle overfeeding.  If we feed too much, we subtract from hunger until it is negative.
    # in that case, we add to digestion equal to the abs value.  overeating = poo hehe
    if hunger < 0:
      digestion = digestion + abs(hunger)
      hunger = 0

    if happiness > MAX_HAPPINESS:
      happiness = MAX_HAPPINESS


def sleep():
  global is_asleep, sleepiness

  while sleepiness > 0:
    yield from animate_sprite("tama", "sleep")
    sleepiness = sleepiness - 2

  is_asleep = False
  start_activity(walk)


def eat():
  global x, y
  move_sprite("food", x - 20, y)

  yield from zip(
    consume_food(-8, 5, 1),
    animate_sprite("tama", "eat", 99),
    animate_sprite("food", "food", 2)
  )

  remove_sprite("food")
  start_activity(walk)


def pat():
  global happiness

  yield from animate_sprite("tama", "squash")

  happiness = happiness + 5
  if happiness > MAX_HAPPINESS:
    happiness = MAX_HAPPINESS

  start_activity(walk)


def treat():
  global x, y
  move_sprite("candy", x - 20, y)

  yield from zip(
    consume_food(-1, 2, 8),
    animate_sprite("tama", "eat", 99),
    animate_sprite("candy", "candy", 2)
  )

  remove_sprite("candy")
  start_activity(walk)


def handle_click(sprite):
  global is_asleep, has_poo

  if sprite == "poo":
    has_poo = False
    remove_sprite("poo")

  if is_asleep:
    return

  if sprite == "feed":
    start_activity(eat)

  if sprite == "tama":
    start_activity(pat)

  if sprite == "treat":
    start_activity(treat)


write("feed", "Feed")
move_sprite("feed", 10, 40)

write("treat", "Treat")
move_sprite("treat", 50, 40)

write("status", name + " is well")
move_sprite("status", 140, 10)

start_activity(walk)
