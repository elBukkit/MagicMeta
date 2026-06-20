package com.elmakers.mine.bukkit.meta.platform;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.logging.Logger;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import org.bukkit.Art;
import org.bukkit.Bukkit;
import org.bukkit.Chunk;
import org.bukkit.Color;
import org.bukkit.FireworkEffect;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Particle;
import org.bukkit.Rotation;
import org.bukkit.Server;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.attribute.Attribute;
import org.bukkit.block.Block;
import org.bukkit.block.BlockFace;
import org.bukkit.boss.BossBar;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.InvalidConfigurationException;
import org.bukkit.configuration.MemorySection;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.enchantments.Enchantment;
import org.bukkit.entity.ArmorStand;
import org.bukkit.entity.Damageable;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.FallingBlock;
import org.bukkit.entity.HumanEntity;
import org.bukkit.entity.Item;
import org.bukkit.entity.ItemFrame;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Painting;
import org.bukkit.entity.Player;
import org.bukkit.entity.Projectile;
import org.bukkit.entity.Sittable;
import org.bukkit.entity.TNTPrimed;
import org.bukkit.entity.Zombie;
import org.bukkit.event.entity.CreatureSpawnEvent;
import org.bukkit.event.entity.EntityExplodeEvent;
import org.bukkit.event.entity.ProjectileHitEvent;
import org.bukkit.generator.BlockPopulator;
import org.bukkit.inventory.FurnaceRecipe;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.Recipe;
import org.bukkit.inventory.ShapedRecipe;
import org.bukkit.inventory.ShapelessRecipe;
import org.bukkit.inventory.meta.PotionMeta;
import org.bukkit.map.MapRenderer;
import org.bukkit.map.MapView;
import org.bukkit.plugin.Plugin;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.projectiles.ProjectileSource;
import org.bukkit.scheduler.BukkitTask;
import org.bukkit.util.BlockVector;
import org.bukkit.util.Vector;

import com.elmakers.mine.bukkit.api.block.MaterialAndData;
import com.elmakers.mine.bukkit.map.BufferedMapCanvas;
import com.elmakers.mine.bukkit.utility.BoundingBox;
import com.elmakers.mine.bukkit.utility.DoorActionType;
import com.elmakers.mine.bukkit.utility.ReflectionUtils;
import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.VersionedPotionEffectType;

public class CompatibilityUtils implements com.elmakers.mine.bukkit.utility.platform.CompatibilityUtils {
    private final Platform platform;

    public CompatibilityUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public void applyPotionEffects(LivingEntity entity, Collection<PotionEffect> effects) {

    }

    @Override
    public boolean isDamaging() {
        return false;
    }

    @Override
    public Inventory createInventory(InventoryHolder holder, int size, final String name) {
        size = (int) (Math.ceil((double) size / 9) * 9);
        size = Math.min(size, 54);
        String translatedName = translateColors(name);
        return Bukkit.createInventory(holder, size, translatedName);
    }

    @Override
    public boolean applyPotionEffect(LivingEntity entity, PotionEffect effect) {
        return false;
    }

    @Override
    public boolean setDisplayNameRaw(ItemStack itemStack, String displayName) {
        return false;
    }

    @Override
    public boolean setDisplayName(ItemStack itemStack, String displayName) {
        return false;
    }

    @Override
    public boolean setLore(ItemStack itemStack, List<String> lore) {
        return false;
    }

    @Override
    public boolean setRawLore(ItemStack itemStack, List<String> lore) {
        return false;
    }

    @Override
    public List<String> getRawLore(ItemStack itemStack) {
        return List.of();
    }

    @Override
    public boolean isInvulnerable(Entity entity) {
        return entity.isInvulnerable();
    }

    @Override
    public void setInvulnerable(Entity entity) {

    }

    @Override
    public void setInvulnerable(Entity entity, boolean flag) {
        entity.setInvulnerable(flag);
    }

    @Override
    public boolean isSilent(Entity entity) {
        return entity.isSilent();
    }

    @Override
    public void setSilent(Entity entity, boolean flag) {
        entity.setSilent(flag);
    }

    @Override
    public boolean isPersist(Entity entity) {
        return entity.isPersistent();
    }

    @Override
    public void setPersist(Entity entity, boolean flag) {
        entity.setPersistent(flag);
    }

    @Override
    public void setRemoveWhenFarAway(Entity entity, boolean flag) {
        if (!(entity instanceof LivingEntity)) return;
        LivingEntity li = (LivingEntity)entity;
        li.setRemoveWhenFarAway(flag);
    }

    @Override
    public boolean isSitting(Entity entity) {
        if (!(entity instanceof Sittable)) return false;
        Sittable sittable = (Sittable)entity;
        return sittable.isSitting();
    }

    @Override
    public void setSitting(Entity entity, boolean flag) {
        if (!(entity instanceof Sittable)) return;
        Sittable sittable = (Sittable)entity;
        sittable.setSitting(flag);
    }

    @Override
    public Painting createPainting(Location location, BlockFace facing, Art art) {
        return null;
    }

    @Override
    public ItemFrame createItemFrame(Location location, BlockFace facing, Rotation rotation, ItemStack item) {
        return null;
    }

    @Override
    public ArmorStand createArmorStand(Location location) {
        return null;
    }

    @Override
    public Entity createEntity(Location location, EntityType entityType) {
        return null;
    }

    @Override
    public boolean isFilledMap(Material material) {
        return false;
    }

    @Override
    public boolean addToWorld(World world, Entity entity, CreatureSpawnEvent.SpawnReason reason) {
        return false;
    }

    @Override
    public Collection<Entity> getNearbyEntities(Location location, double x, double y, double z) {
        return null;
    }

    @Override
    public Runnable getTaskRunnable(BukkitTask task) {
        return null;
    }

    @Override
    public void ageItem(Item item, int ticksToAge) {

    }

    @Override
    public void damage(Damageable target, double amount, Entity source) {

    }

    @Override
    public void damage(Damageable target, double amount, Entity source, String damageType) {

    }

    @Override
    public void magicDamage(Damageable target, double amount, Entity source) {

    }

    @Override
    public Location getEyeLocation(Entity entity) {
        return null;
    }

    @Override
    public YamlConfiguration loadBuiltinConfiguration(String fileName) throws IOException, InvalidConfigurationException {
        return null;
    }

    @Override
    public ConfigurationSection loadConfiguration(File file) throws IOException, InvalidConfigurationException {
        return null;
    }

    @Override
    public ConfigurationSection loadConfiguration(String fileName) throws IOException, InvalidConfigurationException {
        return null;
    }

    @Override
    public YamlConfiguration loadConfiguration(InputStream stream, String fileName) throws IOException, InvalidConfigurationException {
        return null;
    }

    @Override
    public boolean isReady(Chunk chunk) {
        return false;
    }

    @Override
    public boolean createExplosion(Entity entity, World world, double x, double y, double z, float power, boolean setFire, boolean breakBlocks) {
        return false;
    }

    @Override
    public Object getTileEntityData(Location location) {
        return null;
    }

    @Override
    public Object getTileEntity(Location location) {
        return null;
    }

    @Override
    public void clearItems(Location location) {

    }

    @Override
    public void setTileEntityData(Location location, Object data) {

    }


    @Override
    public void setEnvironment(World world, World.Environment environment) {
        // Nah, broken and too ugly anyway
    }

    @Override
    public void playCustomSound(Player player, Location location, String sound, float volume, float pitch) {
        player.playSound(location, sound, volume, pitch);
    }

    @Override
    public List<Entity> selectEntities(CommandSender sender, String selector) {
        if (!selector.startsWith("@")) return null;
        try {
            return Bukkit.selectEntities(sender, selector);
        } catch (IllegalArgumentException ex) {
            platform.getLogger().warning("Invalid selector: " + ex.getMessage());
        }
        return null;
    }

    @Override
    public int getFacing(BlockFace direction) {
        return 0;
    }

    @Override
    @SuppressWarnings("deprecation")
    public MapView getMapById(int id) {
        return Bukkit.getMap(id);
    }

    @Override
    public Map<String, Object> getMap(ConfigurationSection section) {
        return Map.of();
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Map<String, T> getTypedMap(ConfigurationSection section) {
        if (section == null) return null;
        if (section instanceof MemorySection) {
            return (Map<String, T>)ReflectionUtils.getPrivate(platform.getLogger(), section, MemorySection.class, "map");
        }

        // Do it the slow way
        Map<String, T> map = new HashMap<>();
        Set<String> keys = section.getKeys(false);
        for (String key : keys) {
            map.put(key, (T)section.get(key));
        }

        return map;
    }

    @Override
    public boolean setMap(ConfigurationSection section, Map<String, Object> map) {
        if (section == null) return false;
        if (section instanceof MemorySection) {
            return ReflectionUtils.setPrivate(platform.getLogger(), section, MemorySection.class, "map", map);
        }

        return true;
    }

    @Override
    public Vector getPosition(Object entityData, String tag) {
        return null;
    }

    @Override
    public BlockVector getBlockVector(Object entityData, String tag) {
        return null;
    }

    @Override
    public void setTNTSource(TNTPrimed tnt, LivingEntity source) {

    }

    @Override
    public void setEntityMotion(Entity entity, Vector motion) {

    }

    @Override
    public Vector getNormal(Block block, Location intersection) {
        return null;
    }

    @Override
    public boolean setLock(Block block, String lockName) {
        return false;
    }

    @Override
    public boolean clearLock(Block block) {
        return false;
    }

    @Override
    public boolean isLocked(Block block) {
        return false;
    }

    @Override
    public String getLock(Block block) {
        return null;
    }

    @Override
    public void setFallingBlockDamage(FallingBlock entity, float fallHurtAmount, int fallHurtMax) {

    }

    @Override
    public void configureMaxHeights(ConfigurationSection config) {

    }

    @Override
    public int getMinHeight(World world) {
        return 0;
    }

    @Override
    public int getMaxHeight(World world) {
        return 0;
    }

    @Override
    public void setGravity(ArmorStand armorStand, boolean gravity) {
        // I think the NMS method may be slightly different, so if things go wrong we'll have to dig deeper
        armorStand.setGravity(gravity);
    }

    @Override
    public void setGravity(Entity entity, boolean gravity) {
        entity.setGravity(gravity);
    }

    @Override
    public void setDisabledSlots(ArmorStand armorStand, int disabledSlots) {

    }

    @Override
    public int getDisabledSlots(ArmorStand armorStand) {
        return 0;
    }


    @Override
    public void setInvisible(ArmorStand armorStand, boolean invisible) {
        armorStand.setInvisible(invisible);
    }

    @Override
    public void setInvisible(Entity entity, boolean invisible) {

    }

    @Override
    public Boolean isInvisible(Entity entity) {
        return null;
    }

    @Override
    public boolean isPersistentInvisible(Entity entity) {
        return false;
    }

    @Override
    public void setPersistentInvisible(Entity entity, boolean invisible) {

    }

    @Override
    public void setYawPitch(Entity entity, float yaw, float pitch) {

    }

    @Override
    public void setLocation(Entity entity, double x, double y, double z, float yaw, float pitch) {

    }

    @Override
    public void addFlightExemption(Player player, int ticks) {

    }

    @Override
    public boolean isValidProjectileClass(Class<?> projectileType) {
        return false;
    }

    @Override
    public Projectile spawnProjectile(Class<?> projectileType, Location location, Vector direction, ProjectileSource source, float speed, float spread, float spreadLocations, Random random) {
        return null;
    }

    @Override
    public void setDamage(Projectile projectile, double damage) {

    }

    @Override
    public void decreaseLifespan(Projectile projectile, int ticks) {

    }

    @Override
    public Entity spawnEntity(Location target, EntityType entityType, CreatureSpawnEvent.SpawnReason spawnReason) {
        return null;
    }

    @Override
    public String getResourcePack(Server server) {
        return null;
    }

    @Override
    public boolean setResourcePack(Player player, String rp, byte[] hash) {
        return false;
    }

    @Override
    public boolean removeItemAttribute(ItemStack item, Attribute attribute) {
        return false;
    }

    @Override
    public boolean removeItemAttributes(ItemStack item) {
        return false;
    }

    @Override
    public boolean setItemAttribute(ItemStack item, Attribute attribute, double value, String slot, String attributeOperation) {
        return false;
    }

    @Override
    public boolean setItemAttribute(ItemStack item, Attribute attribute, double value, String slot, String attributeOperation, UUID attributeUUID) {
        return false;
    }

    @Override
    public boolean setItemAttribute(ItemStack item, Attribute attribute, double value, String slot, String attributeOperation, UUID attributeUUID, String attributeKey) {
        return false;
    }

    @Override
    public void sendExperienceUpdate(Player player, float experience, int level) {

    }

    @Override
    public Object getEntityData(Entity entity) {
        return null;
    }

    @Override
    public boolean setEntityData(Entity entity, Object tag) {
        return false;
    }

    @Nullable
    @Override
    public EntityType getEntityTypeFromNMS(World world, Object tag) {
        return null;
    }

    @Override
    public String getEntityType(Entity entity) {
        return null;
    }

    @Override
    public void applyItemData(ItemStack item, Block block) {

    }

    @Override
    public void swingOffhand(Entity entity) {

    }

    @Override
    public void swingMainHand(Entity entity) {

    }

    @Override
    public void sendTitle(Player player, String title, String subTitle, int fadeIn, int stay, int fadeOut) {

    }

    @Override
    public boolean sendActionBar(Player player, String message) {
        return false;
    }

    @Override
    public boolean sendActionBar(Player player, String message, String font) {
        return false;
    }

    @Override
    public void setBossBarTitle(BossBar bossBar, String title) {

    }

    @Override
    public boolean setBossBarTitle(BossBar bossBar, String title, String font) {
        return false;
    }

    @Override
    public void sendMessage(CommandSender sender, String message) {

    }

    @Override
    public float getDurability(Material material) {
        return 0;
    }

    @Override
    public void sendBreaking(Player player, long id, Location location, int breakAmount) {

    }

    @Override
    public void clearBreaking(Block block) {

    }

    @Override
    public void setBreaking(Block block, double percentage) {

    }

    @Override
    public void setBreaking(Block block, int breakAmount) {

    }

    @Override
    public void setBreaking(Block block, int breakAmount, int range) {

    }

    @Override
    public Set<String> getTags(Entity entity) {
        return null;
    }

    @Override
    public boolean isJumping(LivingEntity entity) {
        return false;
    }

    @Override
    public float getForwardMovement(LivingEntity entity) {
        return 0;
    }

    @Override
    public float getStrafeMovement(LivingEntity entity) {
        return 0;
    }

    @Override
    public boolean setBlockFast(Block block, Material material, int data) {
        return false;
    }

    @Override
    public boolean setBlockFast(Chunk chunk, int x, int y, int z, Material material, int data) {
        return false;
    }

    @Override
    public boolean setPickupStatus(Projectile projectile, String pickupStatus) {
        return false;
    }

    @Override
    public Block getHitBlock(ProjectileHitEvent event) {
        return null;
    }

    @Override
    public Entity getEntity(World world, UUID uuid) {
        return null;
    }

    @Override
    public Entity getEntity(UUID uuid) {
        return null;
    }

    @Override
    public boolean canRemoveRecipes() {
        return false;
    }

    @Override
    public boolean removeRecipe(Recipe recipe) {
        return false;
    }

    @Override
    public boolean removeRecipe(String key) {
        return false;
    }

    @Override
    public ShapelessRecipe createShapelessRecipe(String key, ItemStack item, Collection<ItemStack> ingredients, boolean ignoreDamage) {
        return null;
    }

    @Override
    public ShapedRecipe createShapedRecipe(String key, ItemStack item) {
        return null;
    }

    @Override
    public FurnaceRecipe createFurnaceRecipe(String key, ItemStack item, ItemStack source, boolean ignoreDamage, float experience, int cookingTime) {
        return null;
    }

    @Override
    public Recipe createBlastingRecipe(String key, ItemStack item, ItemStack source, boolean ignoreDamage, float experience, int cookingTime) {
        return null;
    }

    @Override
    public Recipe createCampfireRecipe(String key, ItemStack item, ItemStack source, boolean ignoreDamage, float experience, int cookingTime) {
        return null;
    }

    @Override
    public Recipe createSmokingRecipe(String key, ItemStack item, ItemStack source, boolean ignoreDamage, float experience, int cookingTime) {
        return null;
    }

    @Override
    public Recipe createStonecuttingRecipe(String key, ItemStack item, ItemStack source, boolean ignoreDamage) {
        return null;
    }

    @Override
    public Recipe createSmithingRecipe(String key, ItemStack item, ItemStack source, ItemStack addition) {
        return null;
    }

    @Override
    public boolean discoverRecipe(HumanEntity entity, String key) {
        return false;
    }

    @Override
    public boolean undiscoverRecipe(HumanEntity entity, String key) {
        return false;
    }

    @Override
    public double getMaxHealth(Damageable li) {
        return 0;
    }

    @Override
    public void setMaxHealth(Damageable li, double maxHealth) {

    }

    @Override
    public Material getMaterial(String blockData) {
        return null;
    }

    @Override
    public Material getMaterial(FallingBlock falling) {
        return null;
    }

    @Override
    public boolean isChunkLoaded(Block block) {
        return false;
    }

    @Override
    public boolean isChunkLoaded(Location location) {
        return false;
    }

    @Override
    public boolean checkChunk(Location location) {
        return false;
    }

    @Override
    public boolean checkChunk(Location location, boolean generate) {
        return false;
    }

    @Override
    public boolean checkChunk(World world, int chunkX, int chunkZ) {
        return false;
    }

    @Override
    public boolean checkChunk(World world, int chunkX, int chunkZ, boolean generate) {
        return false;
    }

    @Override
    public boolean applyBonemeal(Location location) {
        return false;
    }

    @Override
    public Color getColor(PotionMeta meta) {
        return null;
    }

    @Override
    public boolean setColor(PotionMeta meta, Color color) {
        return false;
    }

    @Override
    public byte getLegacyBlockData(FallingBlock falling) {
        return 0;
    }

    @Override
    public String getBlockData(FallingBlock fallingBlock) {
        return null;
    }

    @Override
    public String getBlockData(Material material, byte data) {
        return null;
    }

    @Override
    public String getBlockData(Block block) {
        return null;
    }

    @Override
    public boolean setBlockData(Block block, String data) {
        return false;
    }

    @Override
    public boolean isTopBlock(Block block) {
        return false;
    }

    @Override
    public boolean applyPhysics(Block block) {
        return false;
    }

    @Override
    public ItemStack getKnowledgeBook() {
        return null;
    }

    @Override
    public boolean addRecipeToBook(ItemStack book, Plugin plugin, String recipeKey) {
        return false;
    }

    @Override
    public boolean isPowerable(Block block) {
        return false;
    }

    @Override
    public boolean isPowered(Block block) {
        return false;
    }

    @Override
    public boolean setPowered(Block block, boolean powered) {
        return false;
    }

    @Override
    public boolean extendPiston(Block block) {
        return false;
    }

    @Override
    public boolean toggleBlockPower(Block block) {
        return false;
    }

    @Override
    public boolean canToggleBlockPower(Block block) {
        return false;
    }

    @Override
    public boolean isWaterLoggable(Block block) {
        return false;
    }

    @Override
    public boolean setWaterlogged(Block block, boolean waterlogged) {
        return false;
    }

    @Override
    public boolean setTopHalf(Block block) {
        return false;
    }

    @Override
    public Entity getSource(Entity entity) {
        return null;
    }

    @Override
    public boolean stopSound(Player player, Sound sound) {
        return false;
    }

    @Override
    public boolean stopSound(Player player, String sound) {
        return false;
    }

    @Override
    public boolean lockChunk(Chunk chunk) {
        return false;
    }

    @Override
    public boolean unlockChunk(Chunk chunk) {
        return false;
    }

    @Override
    public Location getHangingLocation(Entity entity) {
        return null;
    }

    @Override
    public BlockFace getCCW(BlockFace face) {
        return null;
    }

    @Override
    public boolean setRecipeGroup(Recipe recipe, String group) {
        return false;
    }

    @Override
    public boolean isSameKey(Plugin plugin, String key, Object keyed) {
        return false;
    }

    @Override
    public boolean setRecipeIngredient(ShapedRecipe recipe, char key, ItemStack ingredient, boolean ignoreDamage) {
        return false;
    }

    @Override
    public boolean setAutoBlockState(Block block, Location target, BlockFace facing, boolean physics, Player originator) {
        return false;
    }

    @Override
    public boolean forceUpdate(Block block, boolean physics) {
        return false;
    }

    @Override
    public int getPhantomSize(Entity entity) {
        return 0;
    }

    @Override
    public boolean setPhantomSize(Entity entity, int size) {
        return false;
    }

    @Override
    public Location getBedSpawnLocation(Player player) {
        return null;
    }

    @Override
    public void loadChunk(Location location, boolean generate, Consumer<Chunk> consumer) {

    }

    @Override
    public void loadChunk(World world, int x, int z, boolean generate) {

    }

    @Override
    public void loadChunk(World world, int x, int z, boolean generate, Consumer<Chunk> consumer) {

    }

    @Override
    public Entity getRootVehicle(Entity entity) {
        return null;
    }

    @Override
    public void addPassenger(Entity vehicle, Entity passenger) {

    }

    @Override
    public List<Entity> getPassengers(Entity entity) {
        return null;
    }

    @Override
    public void teleportVehicle(Entity vehicle, Location location) {

    }

    @Override
    public void teleportWithVehicle(Entity entity, Location location) {

    }

    @Override
    public boolean isTeleporting() {
        return false;
    }

    @Override
    public boolean openBook(Player player, ItemStack itemStack) {
        return false;
    }

    @Override
    public boolean isHandRaised(Player player) {
        return false;
    }

    @Override
    public Class<?> getProjectileClass(String projectileTypeName) {
        return null;
    }

    @Override
    public Entity spawnFireworkEffect(Material fireworkMaterial, Server server, Location location, FireworkEffect effect, int power, Vector direction, Integer expectedLifespan, Integer ticksFlown, boolean silent) {
        return null;
    }

    @Override
    public boolean loadAllTagsFromNBT(ConfigurationSection tags, Object tag) {
        return false;
    }

    @Override
    public BoundingBox getHitbox(Entity entity) {
        return null;
    }

    @Override
    public int getMaxEntityRange() {
        return 0;
    }

    @Override
    public void load(ConfigurationSection configuration) {

    }


    @Override
    public boolean isPrimaryThread() {
        return true;
    }

    @Override
    public String translateColors(String message) {
        return "";
    }

    @Override
    public String getEnchantmentKey(Enchantment enchantment) {
        // We don't use toString here since we'll be parsing this ourselves
        return enchantment.getKey().getNamespace() + ":" + enchantment.getKey().getKey();
    }

    @Nullable
    @Override
    public String getEnchantmentBaseKey(Enchantment enchantment) {
        return "";
    }

    @Override
    public Enchantment getEnchantmentByKey(String key) {
        return null;
    }

    @Override
    public Collection<String> getEnchantmentBaseKeys() {
        return List.of();
    }

    @Override
    public boolean checkDoorAction(Block[] doorBlocks, DoorActionType actionType) {
        return false;
    }

    @Override
    public boolean performDoorAction(Block[] doorBlocks, DoorActionType actionType) {
        return false;
    }

    @Override
    public Block[] getDoorBlocks(Block targetBlock) {
        return new Block[0];
    }

    @Override
    public boolean setTorchFacingDirection(Block block, BlockFace facing) {
        return false;
    }

    @Override
    public boolean isAdult(Zombie zombie) {
        return zombie.isAdult();
    }

    @Override
    public void setBaby(Zombie zombie) {
        zombie.setBaby();
    }

    @Override
    public void setAdult(Zombie zombie) {
        zombie.setAdult();
    }

    @Override
    public boolean tame(Entity entity, Player tamer) {
        return false;
    }

    @Override
    public boolean isArrow(Entity entity) {
        return false;
    }

    @Override
    public void setMaterialCooldown(Player player, Material material, int duration) {

    }

    @Override
    public Particle getParticle(String particle) {
        return null;
    }

    @Override
    public BlockFace getSignFacing(Block sign) {
        return null;
    }

    @Override
    public void sendBlockChange(Player player, Block block) {

    }

    @Override
    public void sendBlockChange(Player player, Location location, Material material, String blockData) {

    }

    @Override
    public void openSign(Player player, Location signBlock) {

    }

    @Override
    public Collection<BoundingBox> getBoundingBoxes(Block block) {
        return List.of();
    }

    @Nonnull
    @Override
    public FallingBlock spawnFallingBlock(Location location, Material material, String blockData) {
        return null;
    }

    @Override
    public UUID getOwnerId(Entity entity) {
        return null;
    }

    @Override
    public void setOwner(Entity entity, Entity owner) {

    }

    @Override
    public void setOwner(Entity entity, UUID ownerId) {

    }

    @Override
    public void setSnowLevel(Block block, int level) {

    }

    @Override
    public int getSnowLevel(Block block) {
        return 0;
    }

    @Nullable
    @Override
    public BlockPopulator createOutOfBoundsPopulator(Logger logger) {
        return null;
    }

    @Override
    public Enchantment getInfinityEnchantment() {
        return null;
    }

    @Override
    public Enchantment getPowerEnchantment() {
        return null;
    }

    @Override
    public Set<PotionEffectType> getNegativeEffects() {
        return Set.of();
    }

    @Override
    public boolean isDestructive(EntityExplodeEvent explosion) {
        return false;
    }

    @Override
    public Attribute getMinecraftAttribute(String attributeKey) {
        return null;
    }

    @Override
    public PotionEffectType getPotionEffectType(VersionedPotionEffectType type) {
        return null;
    }

    @Override
    public void renderMap(MapRenderer renderer, MapView map, BufferedMapCanvas canvas, Player player) {

    }

    @Override
    public BufferedMapCanvas createMapCanvas() {
        return null;
    }

    @Override
    public Entity createBlockDisplayEntity(Location location, MaterialAndData materialAndData, double scale) {
        return null;
    }

    @Override
    public Entity createItemDisplayEntity(Location location, ItemStack itemStack, double scale) {
        return null;
    }

    @Override
    public ItemStack createItemStack(Material material, String itemData) {
        return null;
    }

    @Override
    public boolean lockFreezeTicks(Entity entity, boolean lock) {
        return false;
    }
}
