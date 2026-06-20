package com.elmakers.mine.bukkit.meta.platform;

import org.bukkit.Art;
import org.bukkit.Rotation;
import org.bukkit.block.BlockFace;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.inventory.ItemStack;

import com.elmakers.mine.bukkit.api.magic.MageController;
import com.elmakers.mine.bukkit.entity.EntityExtraData;
import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.VersionedEntityType;

public class EntityUtils implements com.elmakers.mine.bukkit.utility.platform.EntityUtils  {
    private final Platform platform;

    public EntityUtils(final Platform platform) {
        this.platform = platform;
    }

    @Override
    public EntityExtraData getExtraData(MageController controller, Entity entity) {
        return null;
    }

    @Override
    public EntityExtraData getExtraData(MageController controller, EntityType entityType, ConfigurationSection configuration) {
        return null;
    }

    @Override
    public EntityExtraData getNMSData(MageController controller, Object tag) {
        return null;
    }

    @Override
    public EntityExtraData getPaintingData(Art art, BlockFace direction) {
        return null;
    }

    @Override
    public EntityExtraData getItemFrameData(ItemStack item, BlockFace direction, Rotation rotation) {
        return null;
    }

    @Override
    public EntityType getEntityType(VersionedEntityType entityType) {
        return null;
    }
}
