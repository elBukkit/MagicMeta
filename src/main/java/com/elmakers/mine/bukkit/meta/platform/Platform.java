package com.elmakers.mine.bukkit.meta.platform;

import java.util.logging.Logger;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.PluginManager;

import com.elmakers.mine.bukkit.api.magic.MageController;
import com.elmakers.mine.bukkit.utility.platform.EntityMetadataUtils;
import com.elmakers.mine.bukkit.utility.platform.PaperUtils;
import com.elmakers.mine.bukkit.utility.platform.SpigotUtils;

public class Platform implements com.elmakers.mine.bukkit.utility.platform.Platform {
    protected final MageController controller;
    private final Logger logger;
    private final Plugin plugin;
    @Nonnull
    protected final CompatibilityUtils compatibilityUtils;
    @Nonnull
    protected final DeprecatedUtils deprecatedUtils;
    @Nonnull
    protected final InventoryUtils inventoryUtils;
    @Nonnull
    protected final ItemUtils itemUtils;
    @Nonnull
    protected final NBTUtils nbtUtils;
    @Nonnull
    protected final SchematicUtils schematicUtils;
    @Nonnull
    protected final SkinUtils skinUtils;
    @Nonnull
    protected final MobUtils mobUtils;
    @Nonnull
    protected final EntityUtils entityUtils;
    protected final PaperUtils paperUtils;
    protected final SpigotUtils spigotUtils;
    @Nonnull
    protected final EntityMetadataUtils entityMetadataUtils;
    private Boolean hasEntityLoadEvent;
    protected final boolean valid;

    public Platform(MageController controller) {
        this.controller = controller;
        this.plugin = controller.getPlugin();
        this.logger = controller.getLogger();
        this.valid = initialize();

        if (valid) {
            this.compatibilityUtils = createCompatibilityUtils();
            this.deprecatedUtils = createDeprecatedUtils();
            this.inventoryUtils = createInventoryUtils();
            this.itemUtils = createItemUtils();
            this.nbtUtils = createNBTUtils();
            this.schematicUtils = createSchematicUtils();
            this.skinUtils = createSkinUtils();
            this.paperUtils = createPaperUtils();
            this.spigotUtils = createSpigotUtils();
            this.entityMetadataUtils = createEntityMetadataUtils();
            this.entityUtils = createEntityUtils();
            this.mobUtils = createMobUtils();
        } else {
            this.compatibilityUtils = null;
            this.deprecatedUtils = null;
            this.inventoryUtils = null;
            this.itemUtils = null;
            this.nbtUtils = null;
            this.schematicUtils = null;
            this.skinUtils = null;
            this.paperUtils = null;
            this.spigotUtils = null;
            this.entityMetadataUtils = null;
            this.entityUtils = null;
            this.mobUtils = null;
        }
    }

    protected boolean initialize() {
        return true;
    }

    @Override
    public void registerEvents(PluginManager pm) {
    }

    protected EntityMetadataUtils createEntityMetadataUtils() {
        return new PersistentEntityMetadataUtils(this.getPlugin());
    }

    protected EntityUtils createEntityUtils() {
        return new EntityUtils(this);
    }

    protected PaperUtils createPaperUtils() {
        return null;
    }

    protected SpigotUtils createSpigotUtils() {
        return null;
    }

    protected SkinUtils createSkinUtils() {
        return new SkinUtils(this);
    }

    protected SchematicUtils createSchematicUtils() {
        return new SchematicUtils(this);
    }

    protected NBTUtils createNBTUtils() {
        return new NBTUtils(this);
    }

    protected ItemUtils createItemUtils() {
        return new ItemUtils(this);
    }

    protected InventoryUtils createInventoryUtils() {
        return new InventoryUtils(this);
    }

    protected CompatibilityUtils createCompatibilityUtils() {
        return new CompatibilityUtils(this);
    }

    protected DeprecatedUtils createDeprecatedUtils() {
        return new DeprecatedUtils(this);
    }

    protected MobUtils createMobUtils() {
        return new MobUtils(this);
    }

    @Override
    public MageController getController() {
        return controller;
    }

    @Override
    public Plugin getPlugin() {
        return plugin;
    }

    @Override
    public Logger getLogger() {
        return logger;
    }

    @Override
    public boolean isLegacy() {
        return false;
    }

    @Override
    public boolean isCurrentVersion() {
        return true;
    }

    @Override
    public boolean hasStatistics() {
        return true;
    }

    @Override
    public boolean hasEntityTransformEvent() {
        return true;
    }

    @Override
    public boolean hasTimeSkipEvent() {
        return true;
    }

    @Override
    public boolean isValid() {
        return valid;
    }

    @Override
    public CompatibilityUtils getCompatibilityUtils() {
        return compatibilityUtils;
    }

    @Override
    public DeprecatedUtils getDeprecatedUtils() {
        return deprecatedUtils;
    }

    @Override
    public InventoryUtils getInventoryUtils() {
        return inventoryUtils;
    }

    @Override
    public ItemUtils getItemUtils() {
        return itemUtils;
    }

    @Override
    public NBTUtils getNBTUtils() {
        return nbtUtils;
    }

    @Override
    public SchematicUtils getSchematicUtils() {
        return schematicUtils;
    }

    @Override
    public SkinUtils getSkinUtils() {
        return skinUtils;
    }

    @Override
    @Nullable
    public PaperUtils getPaperUtils() {
        return paperUtils;
    }

    @Override
    @Nullable
    public SpigotUtils getSpigotUtils() {
        return spigotUtils;
    }

    @Override
    public EntityMetadataUtils getEnityMetadataUtils() {
        return entityMetadataUtils;
    }

    @Override
    public EntityUtils getEntityUtils() {
        return entityUtils;
    }

    @Override
    public MobUtils getMobUtils() {
        return mobUtils;
    }

    @Override
    public boolean hasChatComponents() {
        return true;
    }

    @Override
    public boolean hasDeferredEntityLoad() {
        return true;
    }

    @Override
    public boolean hasEntityLoadEvent() {
        if (hasEntityLoadEvent == null) {
            try {
                Class.forName("org.bukkit.event.world.EntitiesLoadEvent");
                hasEntityLoadEvent = true;
            } catch (Exception ex) {
                hasEntityLoadEvent = false;
                getLogger().warning("EntitiesLoadEvent not found, it is recommended that you update your server software");
            }
        }
        return hasEntityLoadEvent;
    }
}
